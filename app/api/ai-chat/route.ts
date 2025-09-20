"use server";
import { type NextRequest, NextResponse } from "next/server";
import { AIChatResponse } from "../../../types/ai-chat.types";
import { getAvailableAPIKeys } from "../../../lib/config/api-config";
import { isBusinessRelated } from "../../../lib/services/message-classifier";
// import { generateFallbackResponse } from "../../lib/services/fallBackResponse";
import { APIProviderFactory } from "../../../lib/providers/api-provider-factory";
import {
  // logRequest,
  logAPIKeys,
  logBusinessClassification,
  logFallbackUsage,
  logError,
} from "../../../lib/utils/logging-utils";
import { DatabaseService } from "../../../lib/services/database-service";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";
import { buildRateKey, checkRateLimit } from "../../../lib/utils/rate-limit";
import { logger } from "../../../lib/utils/logger";

async function requireAuth() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return { ok: false as const, status: 401, error: "Unauthorized" };
    }
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, status: 500, error: "Auth check failed" };
  }
}

// 🔧 Local, lightweight fallback generator to remove undeclared imports/vars.
function FallbackResponse(
  lastMessage: string,
  businessRelated: boolean,
  activeRole: string
): string {
  const intro = `As your ${activeRole}, here's a quick, actionable next step.`;
  const base =
    lastMessage?.trim().length > 0
      ? `You asked: "${lastMessage}".`
      : `You haven't asked a specific question yet.`;
  const biz = businessRelated
    ? `This looks business-related. I'll keep it practical and outcome-focused.`
    : `This doesn't look strictly business-related, but I'll still give a clear, helpful direction.`;
  const steps =
    `\n\nNext steps:\n` +
    `1) Clarify your goal in one sentence.\n` +
    `2) List 3 constraints (time, budget, resources).\n` +
    `3) Share any data you have; I'll turn it into a concrete plan.`;
  return `${intro}\n\n${base}\n${biz}${steps}`;
}

/**
 * AI Chat Route
 *
 * Responsibilities
 * - Authenticates the requester (Supabase session)
 * - Applies per-user/IP rate limiting
 * - Normalizes inbound messages and classifies business intent
 * - Attempts provider responses via APIProviderFactory with graceful fallback
 * - Persists AI responses when a valid session is provided and owned by user
 *
 * Edge Cases
 * - If all providers fail, we synthesize a helpful fallback reply
 * - On persistence errors, we log and still return the AI content
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const authUserId = auth.user.id;
    // Validate input
    const rawBody = await request.json();
    const { AIChatBodySchema } = await import(
      "../../../lib/validation/ai-chat"
    );
    const parsed = AIChatBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, activeRole, sessionId, userId } = parsed.data;

    // If userId provided, ensure it matches authenticated user to avoid spoofing
    if (userId && String(userId) !== String(authUserId)) {
      return NextResponse.json(
        { error: "Forbidden: userId does not match authenticated user" },
        { status: 403 }
      );
    }

    // Basic token bucket: per-user plus IP fallback
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";
    const rateKey = buildRateKey(["ai-chat", authUserId, ip]);
    // Capacity 10, refill 0.2 tokens/sec (~12 req/min) – lenient but prevents abuse
    const result = checkRateLimit(rateKey, {
      capacity: 10,
      refillRatePerSec: 0.2,
    });
    if (!result.allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait a few moments before trying again.",
          retryAfterMs: result.retryAfterMs,
        },
        { status: 429 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || "";

    // Check for available API keys
    const apiKeys = getAvailableAPIKeys();
    logAPIKeys(apiKeys);

    // Business-related keywords for classification
    const businessRelated = isBusinessRelated(lastMessage);
    logBusinessClassification(businessRelated);

    // Client already persists the user message. Avoid saving it again here to prevent duplicates.
    let userMessageId: string | undefined;

    // If a sessionId is provided, enforce ownership BEFORE building context or progressing
    if (sessionId) {
      try {
        const session = await DatabaseService.getChatSessionById(sessionId);
        if (!session || String(session.userId) !== String(authUserId)) {
          return NextResponse.json(
            { error: "Unauthorized to access this session" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Unable to verify session ownership" },
          { status: 403 }
        );
      }
    }

    // Try to get response from API providers
    try {
      // Build merged context if sessionId provided; otherwise use incoming messages
      let providerMessages = messages;
      let contextType = "RAW_MESSAGES_ONLY";
      let contextDetails = {};

      try {
        if (sessionId) {
          logger.info("🔍 [AI-CHAT] BUILDING MERGED CONTEXT:", {
            sessionId,
            incomingMessageCount: messages.length,
            lastN: 20,
            maxTokenBudget: 3000,
          });

          const merged = await DatabaseService.getMergedChatContext(
            sessionId,
            20,
            3000
          );

          providerMessages = merged.map((m) => ({
            role: m.role,
            content: m.content,
            // carry summary key data through to provider as metadata
            metadata: m.keyData ? { keyData: m.keyData } : undefined,
          }));

          contextType = "HYBRID (Summaries + Raw)";
          contextDetails = {
            summariesCount: merged.filter((m) => m.role === "system").length,
            rawCount: merged.filter((m) => m.role !== "system").length,
            totalCount: merged.length,
            hasKeyData: merged.some((m) => m.keyData && m.keyData.length > 0),
          };

          logger.info("✅ [AI-CHAT] MERGED CONTEXT BUILT:", {
            sessionId,
            contextType,
            ...contextDetails,
            summaryPreview: merged
              .filter((m) => m.role === "system")
              .map((m, i) => ({
                index: i,
                content: m.content.substring(0, 100) + "...",
                keyData: m.keyData || [],
              })),
          });
        } else {
          logger.info("⚠️ [AI-CHAT] NO SESSION ID - USING RAW MESSAGES:", {
            messageCount: messages.length,
            contextType: "RAW_MESSAGES_ONLY",
          });
        }
      } catch (e) {
        logger.warn("❌ [AI-CHAT] CONTEXT BUILDING FAILED:", {
          error: e instanceof Error ? e.message : String(e),
          fallbackTo: "last-20-raw-messages",
        });

        // Fallback: only last-N raw messages
        try {
          const recent = messages
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content }));
          providerMessages = recent;
          contextType = "FALLBACK_RAW_MESSAGES";
          contextDetails = {
            fallbackReason: "context_building_failed",
            originalCount: messages.length,
            fallbackCount: recent.length,
          };
        } catch (fallbackError) {
          logger.error("💥 [AI-CHAT] FALLBACK ALSO FAILED:", {
            fallbackError:
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
          });
        }
      }

      // 🚀 ENHANCED CONTEXT LOGGING
      logger.info("📊 [AI-CHAT] FINAL PROVIDER CONTEXT:", {
        contextType,
        contextDetails,
        providerMessageCount: providerMessages.length,
        messageBreakdown: {
          system: providerMessages.filter((m) => m.role === "system").length,
          user: providerMessages.filter((m) => m.role === "user").length,
          assistant: providerMessages.filter((m) => m.role === "assistant")
            .length,
        },
        estimatedTokens: providerMessages.reduce(
          (sum, m) => sum + Math.ceil((m.content?.length || 0) / 4),
          0
        ),
        tokenBudget: 3000,
        firstMessagePreview:
          providerMessages[0]?.content?.substring(0, 100) + "...",
        lastMessagePreview:
          providerMessages[providerMessages.length - 1]?.content?.substring(
            0,
            100
          ) + "...",
      });

      // Log context sizes and token estimate
      try {
        const { logContextAssembly } = await import(
          "../../../lib/utils/logger"
        );
        const summariesCount = Array.isArray(providerMessages)
          ? providerMessages.filter((m) => m.role === "system").length
          : 0;
        const rawCount = Array.isArray(providerMessages)
          ? providerMessages.filter((m) => m.role !== "system").length
          : 0;
        const estTokens = Array.isArray(providerMessages)
          ? providerMessages.reduce(
              (sum, m) => sum + Math.ceil((m.content?.length || 0) / 4),
              0
            )
          : 0;
        logContextAssembly({
          summariesCount,
          rawCount,
          estTokens,
          budget: 3000,
        });
      } catch {}

      logger.info("🚀 [AI-CHAT] CALLING API PROVIDER:", {
        providerMessagesCount: providerMessages.length,
        businessRelated,
        activeRole,
        contextType,
      });

      const apiResponse = await APIProviderFactory.getResponse(
        providerMessages as unknown as {
          role: "user" | "assistant" | "system";
          content: string;
        }[],
        businessRelated,
        activeRole
      );

      logger.info("✅ [AI-CHAT] API PROVIDER RESPONSE RECEIVED:", {
        provider: apiResponse.provider,
        responseLength: apiResponse.content.length,
        confidence: apiResponse.confidence,
        responsePreview: apiResponse.content.substring(0, 200) + "...",
      });

      // Store AI response in database if sessionId is provided
      if (sessionId && authUserId) {
        // Verify ownership before writing
        try {
          const session = await DatabaseService.getChatSessionById(sessionId);
          if (!session || String(session.userId) !== String(authUserId)) {
            return NextResponse.json(
              { error: "Unauthorized to write to this session" },
              { status: 403 }
            );
          }
        } catch {}
        try {
          await DatabaseService.createChatMessage({
            content: apiResponse.content,
            role: "ai",
            sessionId,
          });
        } catch (error) {
          logger.error("Failed to store AI response:", error);
          // Continue even if storage fails
        }
      }

      // Send response to client first
      const response = NextResponse.json({
        content: apiResponse.content,
        provider: apiResponse.provider,
        isBusinessRelated: businessRelated,
        confidence: apiResponse.confidence,
        activeRole,
        userMessageId,
      } as AIChatResponse & { userMessageId?: string });

      // Trigger background summarization if threshold exceeded and session present
      if (sessionId && Array.isArray(messages) && messages.length > 50) {
        // Keep last N raw messages untouched
        const LAST_N = 20;
        const cutoff = Math.max(0, messages.length - LAST_N);
        const oldCluster = messages.slice(0, cutoff);

        // Check if we already have summaries for this range to prevent duplication
        try {
          const existingSummaries =
            await DatabaseService.getSummariesBySessionId(sessionId);
          const hasOverlap = existingSummaries.some(
            (existing) =>
              0 <= existing.indexEnd && cutoff - 1 >= existing.indexStart
          );

          if (hasOverlap) {
            logger.warn(
              "⚠️ [AI-CHAT] Summarization Skipped - Overlap Detected",
              {
                sessionId,
                messageCount: messages.length,
                cutoff,
                oldClusterSize: oldCluster.length,
                existingSummaries: existingSummaries.map((s) => ({
                  id: s._id,
                  indexStart: s.indexStart,
                  indexEnd: s.indexEnd,
                  content: s.content.substring(0, 100) + "...",
                })),
              }
            );
          } else {
            // Fire-and-forget request; do not await
            (async () => {
              try {
                const payload = {
                  sessionId,
                  oldMessages: oldCluster,
                  indexStart: 0,
                  indexEnd: cutoff - 1,
                };

                logger.info(
                  "🚀 [AI-CHAT] Triggering Background Summarization",
                  {
                    sessionId,
                    oldClusterSize: oldCluster.length,
                    indexStart: 0,
                    indexEnd: cutoff - 1,
                    totalMessages: messages.length,
                    keepingLastN: LAST_N,
                  }
                );

                const response = await fetch(
                  new URL("/api/summarize-history", request.url).toString(),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }
                );

                if (response.ok) {
                  const result = await response.json();
                  logger.info(
                    "✅ [AI-CHAT] Background Summarization Triggered Successfully",
                    {
                      sessionId,
                      summaryId: result.summaryId,
                      aiSuccess: result.aiSuccess,
                      error: result.error || null,
                    }
                  );
                } else {
                  logger.error("❌ [AI-CHAT] Background Summarization Failed", {
                    sessionId,
                    status: response.status,
                    statusText: response.statusText,
                  });
                }
              } catch (e) {
                logger.error("💥 [AI-CHAT] Background Summarization Error", {
                  sessionId,
                  error: e instanceof Error ? e.message : String(e),
                });
              }
            })();
          }
        } catch (e) {
          logger.warn(
            "⚠️ [AI-CHAT] Could not check for overlaps, skipping summarization",
            {
              sessionId,
              error: e instanceof Error ? e.message : String(e),
            }
          );
        }
      }

      return response;
    } catch (error) {
      logger.error("server error in generating AI response", error);
      // If API providers fail, use fallback response
      logFallbackUsage();

      const fallbackContent = FallbackResponse(
        lastMessage,
        businessRelated,
        activeRole
      );

      // Store fallback response in database if sessionId is provided
      if (sessionId && authUserId) {
        // Verify ownership before writing
        try {
          const session = await DatabaseService.getChatSessionById(sessionId);
          if (!session || String(session.userId) !== String(authUserId)) {
            return NextResponse.json(
              { error: "Unauthorized to write to this session" },
              { status: 403 }
            );
          }
        } catch {}
        try {
          await DatabaseService.createChatMessage({
            content: fallbackContent,
            role: "ai",
            sessionId,
          });
        } catch (error) {
          logger.error("Failed to store fallback response:", error);
        }
      }

      return NextResponse.json({
        content: fallbackContent,
        fallbackMode: true,
        isBusinessRelated: businessRelated,
        confidence: 80,
        activeRole,
        userMessageId,
      } as AIChatResponse & { userMessageId?: string });
    }
  } catch (error) {
    logError(error, "AI chat");
    return NextResponse.json(
      {
        content:
          "I apologize for the technical difficulty. As your business advisor, I'm still here to help with your questions. Could you please try rephrasing your question?",
        fallbackMode: true,
        confidence: 50,
        error: true,
      } as AIChatResponse,
      { status: 500 }
    );
  }
}

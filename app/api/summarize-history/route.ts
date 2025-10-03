"use server";
import { type NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../lib/utils/error-utils";
import { logger } from "../../../lib/utils/logger";
import { DatabaseService } from "../../../lib/services/database-service";
import { summarizeMessages } from "../../../utils/summarizer";
import OpenAI from "openai";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";

const SUMMARIZATION_PROMPT = `
You are a business-focused summarizer. Summarize the following chat messages while keeping chronological flow.

Rules:
1) Preserve order — follow the sequence of discussion.
2) Be concise — max 5 sentences for the summary.
3) Extract all numbers, dates, percentages, KPIs, financial figures, or deadlines into a "keyData" list.
4) Do not hallucinate; only include details present in the messages.
5) Output strict JSON only — no prose, no markdown fence.

JSON shape:
{
  "summary": "short chronological summary",
  "keyData": [{"type":"<number|percentage|date|kpi|amount|other>", "value":"<raw value>"}]
}

Messages:
`;

// Note: Avoid creating OpenAI client at module scope to prevent build-time env requirement

type OldMsg = { role: "user" | "ai"; content: string };

async function generateAISummary(messages: OldMsg[]): Promise<{
  summary: string;
  keyData: Array<{ type: string; value: string }>;
  success: boolean;
  error?: string;
}> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    logger.warn("⚠️ [SUMMARIZATION] OPENAI_API_KEY missing; using regex fallback");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info("🤖 [SUMMARIZATION] AI Summarization Attempt", {
        attempt,
        maxRetries,
        messageCount: messages.length,
        totalContentLength: messages.reduce(
          (sum, m) => sum + m.content.length,
          0
        ),
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      });

      if (!openaiApiKey) {
        throw new Error("Missing OPENAI_API_KEY");
      }

      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // efficient & structured output
        messages: [
          { role: "system", content: SUMMARIZATION_PROMPT },
          {
            role: "user",
            content: JSON.stringify(
              messages.map((m) => ({
                role: m.role,
                content: m.content,
              }))
            ),
          },
        ],
        response_format: { type: "json_object" },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error("Empty response from OpenAI API");
      }

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON response: ${
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error"
          }`
        );
      }

      if (!parsed.summary || typeof parsed.summary !== "string") {
        throw new Error(`Invalid summary format: ${JSON.stringify(parsed)}`);
      }

      logger.info("✅ [SUMMARIZATION] AI Summarization Success", {
        attempt,
        summaryLength: parsed.summary.length,
        keyDataCount: parsed.keyData?.length || 0,
        summaryPreview: parsed.summary.substring(0, 200) + "...",
        keyData: parsed.keyData || [],
      });

      return {
        summary: parsed.summary,
        keyData: parsed.keyData || [],
        success: true,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      logger.warn(
        `❌ [SUMMARIZATION] AI Summarization Attempt ${attempt} Failed`,
        {
          attempt,
          maxRetries,
          error: lastError.message,
          errorType: lastError.constructor.name,
          errorStack: lastError.stack?.split("\n").slice(0, 3).join("\n"),
          messageCount: messages.length,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        }
      );

      // If this is the last attempt, break and fall back to regex
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      logger.info(`⏳ [SUMMARIZATION] Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // All AI attempts failed, fall back to regex
  logger.error("💥 [SUMMARIZATION] All AI Summarization Attempts Failed", {
    totalAttempts: maxRetries,
    finalError: lastError?.message,
    errorType: lastError?.constructor.name,
    fallingBackTo: "regex_summarizer",
  });

  // ✅ fallback: use summarizer util
  const textSummary = summarizeMessages(
    messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: String(m.content ?? ""),
    }))
  );

  logger.warn("⚠️ [SUMMARIZATION] Using Regex Fallback", {
    fallbackReason: "ai_summarization_failed",
    regexSummaryLength: textSummary.length,
    regexSummaryPreview: textSummary.substring(0, 200) + "...",
  });

  return {
    summary: textSummary,
    keyData: [],
    success: false,
    error: lastError?.message || "AI summarization failed after all retries",
  };
}

export const POST = withApiHandler(async (request: NextRequest) => {
  try {
    // Authn: require Supabase user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionId,
      oldMessages, // Ignored for safety; we will fetch canonical messages server-side
      indexStart,
      indexEnd,
    } = body ?? {};

    if (
      !sessionId ||
      !Array.isArray(oldMessages) ||
      typeof indexStart !== "number" ||
      typeof indexEnd !== "number"
    ) {
      logger.error("❌ [SUMMARIZATION] Invalid Request", {
        sessionId: !!sessionId,
        oldMessagesIsArray: Array.isArray(oldMessages),
        indexStartType: typeof indexStart,
        indexEndType: typeof indexEnd,
        body: JSON.stringify(body).substring(0, 500),
      });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Authz: ensure session belongs to the authenticated user
    const session = await DatabaseService.getChatSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }
    if (String(session.userId) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized to summarize this session" },
        { status: 403 }
      );
    }

    logger.info("🚀 [SUMMARIZATION] Starting Summarization Process", {
      sessionId,
      // We will calculate canonical messageCount after fetch
      indexStart,
      indexEnd,
    });

    // Fetch canonical message list in chronological order
    const canonicalMessages = await DatabaseService.getChatMessagesBySessionId(
      sessionId
    );
    const chrono = (canonicalMessages || []).map((m) => ({
      _id: (m as any)._id?.toString?.() ?? undefined,
      role: (m.role === "ai" ? "ai" : "user") as "user" | "ai",
      content: String(m.content ?? ""),
    }));

    // Validate range
    const lastIndex = Math.max(0, chrono.length - 1);
    const safeStart = Math.max(0, Math.min(indexStart, lastIndex));
    const safeEnd = Math.max(safeStart, Math.min(indexEnd, lastIndex));
    const slice = chrono.slice(safeStart, safeEnd + 1);

    logger.info("🧮 [SUMMARIZATION] Canonical Range Computed", {
      totalMessages: chrono.length,
      safeStart,
      safeEnd,
      sliceCount: slice.length,
    });

    const { summary, keyData, success, error } = await generateAISummary(slice);

    // Check for existing summaries to prevent overlaps
    const existingSummaries = await DatabaseService.getSummariesBySessionId(
      sessionId
    );
    const hasOverlap = existingSummaries.some(
      (existing) =>
        indexStart <= existing.indexEnd && indexEnd >= existing.indexStart
    );

    if (hasOverlap) {
      logger.warn(
        "⚠️ [SUMMARIZATION] Overlap Detected - Skipping Summary Creation",
        {
          sessionId,
          indexStart,
          indexEnd,
          existingSummaries: existingSummaries.map((s) => ({
            id: s._id,
            indexStart: s.indexStart,
            indexEnd: s.indexEnd,
            content: s.content.substring(0, 100) + "...",
          })),
        }
      );
      return NextResponse.json({
        ok: false,
        reason: "overlap_detected",
        message: "Summary overlaps with existing summaries",
      });
    }

    const saved = await DatabaseService.createChatSummary({
      sessionId,
      content: summary,
      keyData,
      indexStart: safeStart,
      indexEnd: safeEnd,
    });

    logger.info("✅ [SUMMARIZATION] Summary Created Successfully", {
      sessionId,
      summaryId: saved._id,
      aiSuccess: success,
      summaryLength: summary.length,
      keyDataCount: keyData.length,
      indexStart,
      indexEnd,
    });

    // ✅ delete old messages that were summarized
    const deleteIds = slice.map((m) => m._id).filter(Boolean) as string[];

    if (deleteIds.length > 0) {
      const deleteResult = await DatabaseService.deleteChatsByIds(deleteIds);
      logger.info("🗑️ [SUMMARIZATION] Old Messages Deleted", {
        sessionId,
        deleteIdsCount: deleteIds.length,
        deletedCount: deleteResult.deletedCount,
      });
    }

    return NextResponse.json({
      ok: true,
      summaryId: saved._id,
      aiSuccess: success,
      error: error || null,
    });
  } catch (e) {
    logger.error("💥 [SUMMARIZATION] Critical Error in Summarization Process", {
      error: e instanceof Error ? e.message : String(e),
      errorType: e instanceof Error ? e.constructor.name : "Unknown",
      errorStack:
        e instanceof Error
          ? e.stack?.split("\n").slice(0, 5).join("\n")
          : "No stack trace",
    });
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
});

// GET endpoint to check summary statistics
export const GET = withApiHandler(async (request: NextRequest) => {
  try {
    // Authn: require Supabase user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Authz: ensure session belongs to the authenticated user
    const session = await DatabaseService.getChatSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }
    if (String(session.userId) !== String(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized to access this session" },
        { status: 403 }
      );
    }

    if (action === "stats") {
      // Get summary statistics
      const stats = await DatabaseService.getSummaryStats(sessionId);
      return NextResponse.json({ ok: true, stats });
    } else if (action === "cleanup") {
      // Clean up overlapping summaries
      const result = await DatabaseService.cleanupOverlappingSummaries(
        sessionId
      );
      return NextResponse.json({ ok: true, cleanedCount: result.cleanedCount });
    } else {
      // Get all summaries for the session
      const summaries = await DatabaseService.getSummariesBySessionId(
        sessionId
      );
      return NextResponse.json({ ok: true, summaries });
    }
  } catch (e) {
    logger.error("💥 [SUMMARIZATION] GET Request Failed", {
      error: e instanceof Error ? e.message : String(e),
      errorType: e instanceof Error ? e.constructor.name : "Unknown",
    });
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
});

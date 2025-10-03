import { API_ENDPOINTS, GENERATION_CONFIG } from "../config/api-config";
import { buildSystemPrompt } from "../services/personaDescription-service";
import { logger } from "../utils/logger";

/**
 * ✅ Message structure for chat history
 */
export interface ChatMessage {
  id?: string;
  role: "user" | "system" | "assistant";
  content: string;
  timestamp?: Date;
  activeRole?: string;
}

/**
 * Main XAI chat call
 * Mirrors Gemini provider structure for consistency
 */
export async function callXAIAPI(
  messages: ChatMessage[],
  apiKey: string,
  isBusinessRelated: boolean, // kept for API parity
  activeRole: string
): Promise<string> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("No messages provided for XAI API call.");
  }
  if (!apiKey) {
    throw new Error("Missing XAI API key.");
  }

  // ✅ Build concise system prompt
  const systemInstructionText = buildSystemPrompt(activeRole);

  // ✅ Normalize messages
  const safeMessages = (messages || [])
    .map((m) => ({
      role: m?.role ?? "user",
      content:
        typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0);

  // ✅ Slice last N messages for context (adjust as needed)
  const contextMessages = safeMessages.slice(-8);

  // ✅ OpenAI/XAI-compatible format
  const requestBody = {
    model: "grok-beta",
    messages: [
      { role: "system", content: systemInstructionText },
      ...contextMessages,
    ],
    ...GENERATION_CONFIG.xai,
  };

  // 🚀 DETAILED REQUEST LOGGING
  logger.info("📤 [XAI] API REQUEST DETAILS:", {
    endpoint: API_ENDPOINTS.xai,
    model: "grok-beta",
    systemInstructionLength: systemInstructionText.length,
    systemInstructionPreview: systemInstructionText.substring(0, 200) + "...",
    originalMessageCount: safeMessages.length,
    contextMessageCount: contextMessages.length,
    contextSlice: "last 8 messages",
    messageBreakdown: {
      system: 1,
      user: contextMessages.filter((m) => m.role === "user").length,
      assistant: contextMessages.filter((m) => m.role === "assistant").length,
    },
    generationConfig: GENERATION_CONFIG.xai,
    estimatedTokens: Math.ceil(
      (systemInstructionText.length +
        contextMessages.reduce((sum, m) => sum + m.content.length, 0)) /
        4
    ),
  });

  // Log individual message details
  logger.info("💬 [XAI] MESSAGE DETAILS:", {
    messages: requestBody.messages.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentLength: msg.content.length,
      contentPreview: msg.content.substring(0, 150) + "...",
      isSummary: i > 0 && messages[i - 1]?.role === "system",
    })),
  });

  // Log context slicing information
  if (safeMessages.length > contextMessages.length) {
    logger.info("✂️ [XAI] CONTEXT SLICING:", {
      totalMessages: safeMessages.length,
      contextMessages: contextMessages.length,
      droppedMessages: safeMessages.length - contextMessages.length,
      droppedPreview: safeMessages.slice(0, -8).map((m, i) => ({
        index: i,
        role: m.role,
        content: m.content.substring(0, 100) + "...",
      })),
    });
  }

  try {
    const response = await fetch(API_ENDPOINTS.xai, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("❌ [XAI] API ERROR:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500),
        requestBody: {
          model: "grok-beta",
          messageCount: requestBody.messages.length,
          systemInstructionLength: systemInstructionText.length,
          totalContentLength: contextMessages.reduce(
            (sum, m) => sum + m.content.length,
            0
          ),
        },
      });
      throw new Error(`XAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // ✅ Extract + clean output
    const raw =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      "";

    if (typeof raw !== "string" || raw.trim().length === 0) {
      logger.error("❌ [XAI] INVALID RESPONSE:", {
        responseData: data,
        choices: data?.choices,
        firstChoice: data?.choices?.[0],
      });
      throw new Error("Invalid XAI API response: No text content found.");
    }

    // 🚀 DETAILED RESPONSE LOGGING
    logger.info("📥 [XAI] API RESPONSE RECEIVED:", {
      responseLength: raw.length,
      responsePreview: raw.substring(0, 200) + "...",
      responseStructure: {
        hasChoices: !!data?.choices,
        choiceCount: data?.choices?.length || 0,
        hasMessage: !!data?.choices?.[0]?.message,
        hasContent: !!data?.choices?.[0]?.message?.content,
      },
    });

    const cleaned = raw
      .replace(/^[^\S\n]+/gm, "")
      .replace(/\n{2,}/g, "\n")
      .replace(/\n+$/g, "")
      .replace(/\*+/g, "")
      .replace(/#+\s*/g, "")
      .trim();

    // 🚀 FINAL PROCESSED RESPONSE LOGGING
    logger.info("✨ [XAI] FINAL PROCESSED RESPONSE:", {
      originalLength: raw.length,
      cleanedLength: cleaned.length,
      removedLength: raw.length - cleaned.length,
      cleaningApplied: {
        whitespaceRemoved: raw.length !== raw.trim().length,
        newlinesNormalized: /\n{2,}/.test(raw),
        asterisksRemoved: /\*+/.test(raw),
        headersRemoved: /#+\s*/.test(raw),
      },
    });

    return cleaned;
  } catch (err) {
    logger.error("❌ [XAI] API CALL FAILED:", {
      error: err instanceof Error ? err.message : String(err),
      requestBody: {
        model: "grok-beta",
        messageCount: requestBody.messages.length,
        systemInstructionLength: systemInstructionText.length,
      },
    });
    throw err;
  }
}

import { API_ENDPOINTS, GENERATION_CONFIG } from "../config/api-config";
import { buildSystemPrompt } from "../services/personaDescription-service";
import { logger } from "../utils/logger";

/**
 * ✅ Local type for provider messages
 */
import type { ProviderMessage } from "../../types/shared";
type ProviderRole = "user" | "assistant" | "system";

function stripScoringArtifacts(responseText: string): string {
  return responseText
    .replace(/progress score\s*:\s*\d+/i, "")
    .replace(/Total Score:\s*\d+\s*\/\s*\d+/i, "")
    .replace(/Score Awarded:\s*[+-]?\d+\s*points?/i, "")
    .trim();
}

/**
 * Main Groq chat call
 */
export async function callGroqAPI(
  messages: ProviderMessage[],
  apiKey: string,
  isBusinessRelated: boolean,
  activeRole: string
): Promise<{ cleaned: string }> {
  const systemInstructionText = buildSystemPrompt(activeRole);

  // ✅ Normalize messages
  const safeMessages = (messages || [])
    .map((m) => ({
      role: m?.role ?? "user",
      content:
        typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
      roleContext:
        typeof m?.roleContext === "string" && m.roleContext.trim().length > 0
          ? m.roleContext.trim()
          : undefined,
    }))
    .filter((m) => m.content.trim().length > 0);

  // ✅ OpenAI/Groq message format
  const formattedMessages = [
    { role: "system", content: systemInstructionText },
    ...safeMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  // ✅ Request body
  const requestBody = {
    model: "mixtral-8x7b-32768", // Groq's chat model, adjust if needed
    messages: formattedMessages,
    ...GENERATION_CONFIG.groq,
  };

  // 🚀 DETAILED REQUEST LOGGING
  logger.info("📤 [GROQ] API REQUEST DETAILS:", {
    endpoint: API_ENDPOINTS.groq,
    model: "mixtral-8x7b-32768",
    systemInstructionLength: systemInstructionText.length,
    systemInstructionPreview: systemInstructionText.substring(0, 200) + "...",
    messageCount: formattedMessages.length,
    messageBreakdown: {
      system: 1,
      user: formattedMessages.filter((m) => m.role === "user").length,
      assistant: formattedMessages.filter((m) => m.role === "assistant").length,
    },
    generationConfig: GENERATION_CONFIG.groq,
    estimatedTokens: Math.ceil(
      (systemInstructionText.length +
        safeMessages.reduce((sum, m) => sum + m.content.length, 0)) /
        4
    ),
  });

  // Log individual message details
  logger.info("💬 [GROQ] MESSAGE DETAILS:", {
    messages: formattedMessages.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentLength: msg.content.length,
      contentPreview: msg.content.substring(0, 150) + "...",
      isSummary: i > 0 && messages[i - 1]?.role === "system",
    })),
  });

  // ✅ Call Groq API
  const response = await fetch(`${API_ENDPOINTS.groq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("❌ [GROQ] API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500),
      requestBody: {
        model: "mixtral-8x7b-32768",
        messageCount: formattedMessages.length,
        systemInstructionLength: systemInstructionText.length,
        totalContentLength: safeMessages.reduce(
          (sum, m) => sum + m.content.length,
          0
        ),
      },
    });
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const raw =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [GROQ] INVALID RESPONSE:", {
      responseData: data,
      choices: data?.choices,
      firstChoice: data?.choices?.[0],
    });
    throw new Error("Invalid Groq API response: No text content found.");
  }

  // 🚀 DETAILED RESPONSE LOGGING
  logger.info("📥 [GROQ] API RESPONSE RECEIVED:", {
    responseLength: raw.length,
    responsePreview: raw.substring(0, 200) + "...",
    hasProgressArtifacts:
      /progress score\s*:\s*\d+|Total Score:\s*\d+\s*\/\s*\d+/i.test(raw),
    responseStructure: {
      hasChoices: !!data?.choices,
      choiceCount: data?.choices?.length || 0,
      hasMessage: !!data?.choices?.[0]?.message,
      hasContent: !!data?.choices?.[0]?.message?.content,
    },
  });

  const aiRaw = raw
    .replace(/^[^\S\n]+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\n+$/g, "")
    .replace(/\[HISTORY\]/gi, "")
    .replace(/\[CURRENT\]/gi, "")
    .trim();

  const cleaned = stripScoringArtifacts(aiRaw);

  // 🚀 FINAL PROCESSED RESPONSE LOGGING
  logger.info("✨ [GROQ] FINAL PROCESSED RESPONSE:", {
    originalLength: raw.length,
    cleanedLength: cleaned.length,
    removedLength: raw.length - cleaned.length,
    cleaningApplied: {
      whitespaceRemoved: raw.length !== raw.trim().length,
      newlinesNormalized: /\n{2,}/.test(raw),
      historyTagsRemoved: /\[HISTORY\]/i.test(raw),
      currentTagsRemoved: /\[CURRENT\]/i.test(raw),
    },
  });

  return { cleaned };
}

/**
 * Groq title generator (2–3 words)
 */
export async function callGroqAPIForTitle(userMsg: string, apiKey: string) {
  const systemInstructionText =
    "You are a helpful assistant that generates a chat title. Title should be 2 to 3 words, meaningful. If greetings only → 'Greeting'.";

  const requestBody = {
    model: "mixtral-8x7b-32768",
    messages: [
      { role: "system", content: systemInstructionText },
      { role: "user", content: userMsg },
    ],
    ...GENERATION_CONFIG.groq,
  };

  logger.info("📤 [GROQ] TITLE GENERATION REQUEST:", {
    userMessage: userMsg,
    systemInstruction: systemInstructionText,
    requestBody: requestBody,
  });

  const response = await fetch(`${API_ENDPOINTS.groq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  const raw =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [GROQ] TITLE GENERATION FAILED:", {
      responseData: data,
      userMessage: userMsg,
    });
    throw new Error("Invalid Groq API response: No title found.");
  }

  const title = raw.trim();
  logger.info("✅ [GROQ] TITLE GENERATED:", {
    userMessage: userMsg,
    generatedTitle: title,
  });

  return title;
}

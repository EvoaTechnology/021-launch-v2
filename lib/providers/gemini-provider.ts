import { API_ENDPOINTS, GENERATION_CONFIG } from "../config/api-config";
import { buildSystemPrompt } from "../services/personaDescription-service";
import { logger } from "../utils/logger";

/**
 * ✅ Local type for provider messages
 */
import type { ProviderMessage } from "../../types/shared";
type ProviderRole = "user" | "assistant" | "system";

// Minimal Gemini response part typing
type GeminiContentPart = {
  text?: string;
  inline_data?: {
    data?: string;
  };
};

function toGeminiRole(role: ProviderRole): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

function stripScoringArtifacts(responseText: string): string {
  return responseText
    .replace(
      /(Total Score:\s*\d+\s*\/\s*\d+|Score Awarded:\s*[+-]?\d+\s*points?)/gi,
      ""
    )
    .trim();
}

/**
 * Main Gemini chat call
 */
export async function callGeminiAPI(
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

  // ✅ Map messages for Gemini
  const contentsPayload = safeMessages.map((msg) => {
    const geminiRole = toGeminiRole(msg.role);
    return {
      role: geminiRole,
      parts: [{ text: msg.content }],
    };
  });

  // ✅ Request body
  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: contentsPayload,
    generationConfig: GENERATION_CONFIG.gemini,
  };

  // 🚀 DETAILED REQUEST LOGGING
  logger.info("📤 [GEMINI] API REQUEST DETAILS:", {
    endpoint: `${API_ENDPOINTS.gemini}?key=${apiKey.substring(0, 8)}...`,
    systemInstructionLength: systemInstructionText.length,
    systemInstructionPreview: systemInstructionText.substring(0, 200) + "...",
    messageCount: contentsPayload.length,
    messageBreakdown: {
      user: contentsPayload.filter((m) => m.role === "user").length,
      model: contentsPayload.filter((m) => m.role === "model").length,
    },
    generationConfig: GENERATION_CONFIG.gemini,
    estimatedTokens: Math.ceil(
      (systemInstructionText.length +
        contentsPayload.reduce((sum, m) => sum + m.parts[0].text.length, 0)) /
        4
    ),
  });

  // Log individual message details
  logger.info("💬 [GEMINI] MESSAGE DETAILS:", {
    messages: contentsPayload.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentLength: msg.parts[0].text.length,
      contentPreview: msg.parts[0].text.substring(0, 150) + "...",
      isSummary: i < safeMessages.length && safeMessages[i].role === "system",
    })),
  });

  // ✅ Call Gemini API
  const response = await fetch(`${API_ENDPOINTS.gemini}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("❌ [GEMINI] API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500),
      requestBody: {
        systemInstructionLength: systemInstructionText.length,
        messageCount: contentsPayload.length,
        totalContentLength: contentsPayload.reduce(
          (sum, m) => sum + m.parts[0].text.length,
          0
        ),
      },
    });
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const raw =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
    "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [GEMINI] INVALID RESPONSE:", {
      responseData: data,
      candidates: data?.candidates,
      firstCandidate: data?.candidates?.[0],
    });
    throw new Error("Invalid Gemini API response: No text content found.");
  }

  // 🚀 DETAILED RESPONSE LOGGING
  logger.info("📥 [GEMINI] API RESPONSE RECEIVED:", {
    responseLength: raw.length,
    responsePreview: raw.substring(0, 200) + "...",
    hasProgressScore: /\[progress_score:\s*\d+\]/i.test(raw),
    responseStructure: {
      hasCandidates: !!data?.candidates,
      candidateCount: data?.candidates?.length || 0,
      hasContent: !!data?.candidates?.[0]?.content,
      hasParts: !!data?.candidates?.[0]?.content?.parts,
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
  logger.info("✨ [GEMINI] FINAL PROCESSED RESPONSE:", {
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
 * Gemini title generator (2–3 words)
 */
export async function callGeminiAPIForTitle(userMsg: string) {
  const systemInstructionText =
    "You are a helpful assistant that generates a chat title. Title should be 2 to 3 words, meaningful. If greetings only → 'Greeting'.";

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMsg }],
      },
    ],
    generationConfig: GENERATION_CONFIG.gemini,
  };

  logger.info("📤 [GEMINI] TITLE GENERATION REQUEST:", {
    userMessage: userMsg,
    systemInstruction: systemInstructionText,
    requestBody: requestBody,
  });

  const response = await fetch(
    `${API_ENDPOINTS.gemini}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  const data = await response.json();

  const raw =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
    "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [GEMINI] TITLE GENERATION FAILED:", {
      responseData: data,
      userMessage: userMsg,
    });
    throw new Error("Invalid Gemini API response: No title found.");
  }

  const title = raw.trim();
  logger.info("✅ [GEMINI] TITLE GENERATED:", {
    userMessage: userMsg,
    generatedTitle: title,
  });

  return title;
}
/**
 * Report-specific helpers (Gemini)
 */
export type GeminiReportMessage = {
  role: "user" | "assistant";
  content: string;
};

function mapRole(role: "user" | "assistant"): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

export function buildReportSystemMessageForGemini(
  baseInstruction: string,
  partialReport?: string
): string {
  const incremental = partialReport
    ? `You are receiving the report incrementally. Merge new insights into the existing partial report without duplicating sections. Preserve structure and tags strictly.`
    : `Generate the complete report strictly following the provided structure and tags.`;
  return `${baseInstruction}\n\n${incremental}\n\nRules:\n- Only output the report body.\n- Preserve tags, headings, and JSON keys exactly.\n- No prose outside the report.\n- If information is missing, leave placeholders clearly marked TODO.`;
}

export async function callGeminiForReport(
  apiKey: string,
  systemInstruction: string,
  payloadMessages: GeminiReportMessage[],
  partialReport?: string,
  chunkIndex?: number
): Promise<string> {
  const contents = [
    ...(partialReport
      ? [
          {
            role: "user" as const,
            parts: [{ text: `Current partial report draft:\n${partialReport}` }],
          },
        ]
      : []),
    ...payloadMessages.map((m) => ({
      role: mapRole(m.role),
      parts: [{ text: m.content }],
    })),
  ];

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: GENERATION_CONFIG.gemini,
  } as const;

  logger.info("📤 [GEMINI] REPORT REQUEST", {
    systemLen: systemInstruction.length,
    payloadCount: payloadMessages.length,
    hasPartial: !!partialReport,
    chunkIndex,
  });

  const response = await fetch(`${API_ENDPOINTS.gemini}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const text = await response.text();
    logger.error("❌ [GEMINI] REPORT ERROR", {
      status: response.status,
      text,
      chunkIndex,
    });
    throw new Error(`Gemini error ${response.status} (chunk ${chunkIndex}): ${text}`);
  }

  const data = await response.json();
  console.log("data", data);
  const parts: GeminiContentPart[] =
    (data?.candidates?.[0]?.content?.parts as GeminiContentPart[]) || [];
  console.log("parts", parts);
  const textFromParts = parts
    .map((p: GeminiContentPart) => (typeof p?.text === "string" ? p.text : ""))
    .filter((t) => t && t.trim().length > 0)
    .join("\n")
    .trim();
  console.log("textFromParts", textFromParts);
  if (textFromParts) return textFromParts;

  const inlineFromParts = parts
    .map((p: GeminiContentPart) =>
      typeof p?.inline_data?.data === "string" ? p.inline_data.data : ""
    )
    .filter((t) => t && t.trim().length > 0)
    .join("\n")
    .trim();
  console.log("inlineFromParts", inlineFromParts);
  if (inlineFromParts) return inlineFromParts;

  const feedback =
    data?.promptFeedback?.blockReason || data?.promptFeedback?.safetyRatings;
  if (feedback) {
    throw new Error(
      `Gemini returned no content (chunk ${chunkIndex}, feedback: ${JSON.stringify(
        feedback
      )})`
    );
  }

  throw new Error(`Gemini returned empty content (chunk ${chunkIndex})`);
}

export function chunkGeminiMessages(
  items: GeminiReportMessage[],
  parts: number
): GeminiReportMessage[][] {
  if (parts <= 1) return [items];
  const size = Math.ceil(items.length / parts);
  const chunks: GeminiReportMessage[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function generateReportWithChunkingGemini(params: {
  apiKey: string;
  baseInstruction: string;
  fullMessages: GeminiReportMessage[];
  thresholdCount?: number;
  thresholdChars?: number;
  maxParts?: number;
}): Promise<string> {
  const thresholdCount = params.thresholdCount ?? 60;
  const thresholdChars = params.thresholdChars ?? 8000; // new char threshold
  const maxParts = params.maxParts ?? 4;

  const normalized: GeminiReportMessage[] = (params.fullMessages || [])
    .filter((m) => typeof m?.content === "string" && m.content.trim().length)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  const totalChars = normalized.reduce(
    (sum, m) => sum + m.content.length,
    0
  );

  let partialReport: string | undefined = undefined;

  if (normalized.length > thresholdCount || totalChars > thresholdChars) {
    const parts = Math.min(
      maxParts,
      normalized.length > thresholdCount * 3 || totalChars > thresholdChars * 3
        ? 4
        : normalized.length > thresholdCount * 2 || totalChars > thresholdChars * 2
        ? 3
        : 2
    );

    const chunks = chunkGeminiMessages(normalized, parts);
    for (let i = 0; i < chunks.length; i++) {
      const systemInstruction = buildReportSystemMessageForGemini(
        params.baseInstruction,
        partialReport
      );
      const result = await callGeminiForReport(
        params.apiKey,
        systemInstruction,
        chunks[i],
        partialReport,
        i + 1
      );
      partialReport = result;
      console.log("partialReport", partialReport);
    }
    return partialReport || "";

  } else {
    const systemInstruction = buildReportSystemMessageForGemini(
      params.baseInstruction
    );
    return await callGeminiForReport(
      params.apiKey,
      systemInstruction,
      normalized,
      undefined,
      1
    );
  }
}

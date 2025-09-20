import { API_ENDPOINTS, GENERATION_CONFIG } from "../config/api-config";
import { buildSystemPrompt } from "../services/personaDescription-service";
import { logger } from "../utils/logger";
import type { ProviderMessage } from "../../types/shared";

export type OAIRole = "system" | "user" | "assistant";

export interface OAIMessage {
  role: OAIRole;
  content: string;
}

export interface ReportChunkRequest {
  systemInstruction: string;
  payloadMessages: OAIMessage[];
  partialReport?: string;
  model?: string;
}

/**
 * Build a compact system message that guides the model to fill a fixed report.
 * It supports incremental fills when partialReport is provided.
 */
export function buildReportSystemMessage(
  baseInstruction: string,
  partialReport?: string
): string {
  const incremental = partialReport
    ? `You are receiving the report incrementally. Merge new insights into the existing partial report without duplicating sections. Preserve structure and tags strictly.`
    : `Generate the complete report strictly following the provided structure and tags.`;
  return `${baseInstruction}\n\n${incremental}\n\nRules:\n- Only output the report body.\n- Preserve tags, headings, and JSON keys exactly.\n- No prose outside the report.\n- If information is missing, leave placeholders clearly marked TODO.`;
}

/**
 * Call OpenAI with a system instruction plus payload messages.
 */
export async function callOpenAIForReport(
  apiKey: string,
  req: ReportChunkRequest
): Promise<string> {
  if (!apiKey) throw new Error("Missing OpenAI API key.");

  const model = req.model || "gpt-4o-mini"; // lightweight model
  const messages = [
    { role: "system", content: req.systemInstruction },
    ...(req.partialReport
      ? [
          {
            role: "assistant",
            content: req.partialReport,
          },
        ]
      : []),
    ...req.payloadMessages,
  ];

  const body = {
    model,
    messages,
    ...GENERATION_CONFIG.openai,
  } as const;

  logger.info("📤 [OPENAI] REPORT REQUEST", {
    model,
    systemLen: req.systemInstruction.length,
    payloadCount: req.payloadMessages.length,
    hasPartial: !!req.partialReport,
  });

  const resp = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    logger.error("❌ [OPENAI] REPORT ERROR", { status: resp.status, text });
    throw new Error(`OpenAI error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content =
    data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.delta?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenAI returned empty content");
  }
  return content.trim();
}

/**
 * Split messages into N roughly equal chunks.
 */
export function chunkMessages(
  items: OAIMessage[],
  parts: number
): OAIMessage[][] {
  if (parts <= 1) return [items];
  const size = Math.ceil(items.length / parts);
  const chunks: OAIMessage[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Drive the chunked flow. If messages exceed threshold, break, call sequentially, feeding partial report each time.
 */
function stripScoringArtifacts(responseText: string): string {
  return responseText
    .replace(
      /(Total Score:\s*\d+\s*\/\s*\d+|Score Awarded:\s*[+-]?\d+\s*points?)/gi,
      ""
    )
    .trim();
}

function toOpenAIRole(role: string): OAIRole {
  if (role === "assistant") return "assistant";
  if (role === "system") return "system";
  return "user";
}

/**
 * Main OpenAI chat call - similar to callGeminiAPI
 */
export async function callOpenAIAPI(
  messages: ProviderMessage[],
  apiKey: string,
  isBusinessRelated: boolean,
  activeRole: string
): Promise<{ cleaned: string }> {
  const systemInstructionText = buildSystemPrompt(activeRole);

  // Normalize messages
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

  // Convert to OpenAI format
  const openAIMessages = [
    {
      role: "system" as const,
      content: systemInstructionText,
    },
    ...safeMessages.map((msg) => ({
      role: toOpenAIRole(msg.role),
      content: msg.content,
    })),
  ];

  // Request body
  const requestBody = {
    model: "gpt-4o-mini", // You can make this configurable
    messages: openAIMessages,
    ...GENERATION_CONFIG.openai,
  };

  // Detailed request logging
  logger.info("📤 [OPENAI] API REQUEST DETAILS:", {
    endpoint: API_ENDPOINTS.openai,
    model: "gpt-4o-mini",
    systemInstructionLength: systemInstructionText.length,
    systemInstructionPreview: systemInstructionText.substring(0, 200) + "...",
    messageCount: openAIMessages.length,
    messageBreakdown: {
      system: openAIMessages.filter((m) => m.role === "system").length,
      user: openAIMessages.filter((m) => m.role === "user").length,
      assistant: openAIMessages.filter((m) => m.role === "assistant").length,
    },
    generationConfig: GENERATION_CONFIG.openai,
    estimatedTokens: Math.ceil(
      (systemInstructionText.length +
        safeMessages.reduce((sum, m) => sum + m.content.length, 0)) /
        4
    ),
  });

  // Log individual message details
  logger.info("💬 [OPENAI] MESSAGE DETAILS:", {
    messages: openAIMessages.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentLength: msg.content.length,
      contentPreview: msg.content.substring(0, 150) + "...",
      isSystem: msg.role === "system",
    })),
  });

  // Call OpenAI API
  const response = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("❌ [OPENAI] API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500),
      requestBody: {
        model: "gpt-4o-mini",
        systemInstructionLength: systemInstructionText.length,
        messageCount: openAIMessages.length,
        totalContentLength: safeMessages.reduce(
          (sum, m) => sum + m.content.length,
          0
        ),
      },
    });
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const raw = data?.choices?.[0]?.message?.content ?? "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [OPENAI] INVALID RESPONSE:", {
      responseData: data,
      choices: data?.choices,
      firstChoice: data?.choices?.[0],
    });
    throw new Error("Invalid OpenAI API response: No text content found.");
  }

  // Detailed response logging
  logger.info("📥 [OPENAI] API RESPONSE RECEIVED:", {
    responseLength: raw.length,
    responsePreview: raw.substring(0, 200) + "...",
    hasProgressScore: /\[progress_score:\s*\d+\]/i.test(raw),
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

  // Final processed response logging
  logger.info("✨ [OPENAI] FINAL PROCESSED RESPONSE:", {
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
 * OpenAI title generator (2–3 words)
 */
export async function callOpenAIAPIForTitle(userMsg: string, apiKey: string) {
  const systemInstructionText =
    "You are a helpful assistant that generates a chat title. Title should be 2 to 3 words, meaningful. If greetings only → 'Greeting'.";

  const requestBody = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system" as const,
        content: systemInstructionText,
      },
      {
        role: "user" as const,
        content: userMsg,
      },
    ],
    ...GENERATION_CONFIG.openai,
  };

  logger.info("📤 [OPENAI] TITLE GENERATION REQUEST:", {
    userMessage: userMsg,
    systemInstruction: systemInstructionText,
    model: "gpt-4o-mini",
  });

  const response = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  const raw = data?.choices?.[0]?.message?.content ?? "";

  if (typeof raw !== "string" || raw.trim().length === 0) {
    logger.error("❌ [OPENAI] TITLE GENERATION FAILED:", {
      responseData: data,
      userMessage: userMsg,
    });
    throw new Error("Invalid OpenAI API response: No title found.");
  }

  const title = raw.trim();
  logger.info("✅ [OPENAI] TITLE GENERATED:", {
    userMessage: userMsg,
    generatedTitle: title,
  });

  return title;
}

export async function generateReportWithChunking(params: {
  apiKey: string;
  baseInstruction: string;
  fullMessages: Array<{ role: "user" | "assistant"; content: string }>;
  thresholdCount?: number;
  maxParts?: number;
  model?: string;
}): Promise<string> {
  const thresholdCount = params.thresholdCount ?? 60;
  const maxParts = params.maxParts ?? 4;

  const normalized: OAIMessage[] = (params.fullMessages || [])
    .filter((m) => typeof m?.content === "string" && m.content.trim().length)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  let partialReport: string | undefined = undefined;

  if (normalized.length > thresholdCount) {
    const parts = Math.min(
      maxParts,
      normalized.length > thresholdCount * 3
        ? 4
        : normalized.length > thresholdCount * 2
        ? 3
        : 2
    );
    const chunks = chunkMessages(normalized, parts);
    for (let i = 0; i < chunks.length; i++) {
      const systemInstruction = buildReportSystemMessage(
        params.baseInstruction,
        partialReport
      );
      const result = await callOpenAIForReport(params.apiKey, {
        systemInstruction,
        payloadMessages: chunks[i],
        partialReport,
        model: params.model,
      });
      partialReport = result;
      console.log("partialReport", partialReport);
    }
    return partialReport || "";
  } else {
    const systemInstruction = buildReportSystemMessage(params.baseInstruction);
    return await callOpenAIForReport(params.apiKey, {
      systemInstruction,
      payloadMessages: normalized,
      model: params.model,
    });
  }
}

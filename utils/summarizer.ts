/**
 * Enhanced summarization utility for chat memory/context management.
 *
 * Purpose
 * - Extract key business signals from a conversation with better context
 * - Signals: currency values ($), percentages, dates, plain numbers, and
 *   decision-related phrases (e.g., "plan", "decide", "next step").
 * - Deterministic and lightweight: uses regex + smart grouping for better readability
 * - Fallback when AI summarization fails
 *
 * Usage
 * - Given the full message history (user + AI) in chronological order,
 *   call `summarizeMessages(messages)` to produce a concise summary that
 *   groups related concepts and provides better context.
 */

import type { ChatMessage } from "../types/shared";

/**
 * Enhanced token extraction with better categorization and context
 */
function extractTokensWithContext(text: string): {
  numbers: string[];
  decisions: string[];
  dates: string[];
  currency: string[];
  percentages: string[];
  other: string[];
} {
  if (!text || typeof text !== "string") {
    return {
      numbers: [],
      decisions: [],
      dates: [],
      currency: [],
      percentages: [],
      other: [],
    };
  }

  // Month names for simple date detection
  const MONTHS =
    "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December";

  // Enhanced patterns for better extraction
  const patterns = {
    currency: new RegExp(String.raw`\$\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?`, "gi"),
    percentages: new RegExp(String.raw`\d+(?:\.\d+)?\s?%`, "gi"),
    percentWords: new RegExp(
      String.raw`\b\d+(?:\.\d+)?\s?(?:percent|pct)\b`,
      "gi"
    ),
    isoDates: new RegExp(String.raw`\b\d{4}-\d{2}-\d{2}\b`, "gi"),
    usDates: new RegExp(String.raw`\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b`, "gi"),
    monthDates: new RegExp(
      String.raw`\b(?:${MONTHS})\s+\d{1,2}(?:,\s*\d{2,4})?\b`,
      "gi"
    ),
    decisions: new RegExp(
      String.raw`\b(?:plan|planning|decide|decided|decision|next\s*step(?:s)?|milestone(?:s)?|approve(?:d)?|launch|budget|timeline|strategy|goal|target|objective)\b`,
      "gi"
    ),
    numbers: new RegExp(String.raw`\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b`, "gi"),
  };

  const tokens = {
    numbers: [] as string[],
    decisions: [] as string[],
    dates: [] as string[],
    currency: [] as string[],
    percentages: [] as string[],
    other: [] as string[],
  };

  // Extract currency first (to avoid double-counting with numbers)
  for (
    let match = patterns.currency.exec(text);
    match;
    match = patterns.currency.exec(text)
  ) {
    tokens.currency.push(match[0]);
  }

  // Extract percentages
  for (
    let match = patterns.percentages.exec(text);
    match;
    match = patterns.percentages.exec(text)
  ) {
    tokens.percentages.push(match[0]);
  }

  // Extract percentage words
  for (
    let match = patterns.percentWords.exec(text);
    match;
    match = patterns.percentWords.exec(text)
  ) {
    tokens.percentages.push(match[0]);
  }

  // Extract dates
  for (
    let match = patterns.isoDates.exec(text);
    match;
    match = patterns.isoDates.exec(text)
  ) {
    tokens.dates.push(match[0]);
  }
  for (
    let match = patterns.usDates.exec(text);
    match;
    match = patterns.usDates.exec(text)
  ) {
    tokens.dates.push(match[0]);
  }
  for (
    let match = patterns.monthDates.exec(text);
    match;
    match = patterns.monthDates.exec(text)
  ) {
    tokens.dates.push(match[0]);
  }

  // Extract decision phrases
  for (
    let match = patterns.decisions.exec(text);
    match;
    match = patterns.decisions.exec(text)
  ) {
    tokens.decisions.push(match[0]);
  }

  // Extract numbers (excluding already captured currency/percentages)
  for (
    let match = patterns.numbers.exec(text);
    match;
    match = patterns.numbers.exec(text)
  ) {
    const num = match[0];
    // Don't add if it's already captured as currency or percentage
    if (
      !tokens.currency.some((c) => c.includes(num)) &&
      !tokens.percentages.some((p) => p.includes(num))
    ) {
      tokens.numbers.push(num);
    }
  }

  return tokens;
}

/**
 * Create meaningful summary from extracted tokens
 */
function createMeaningfulSummary(
  tokens: {
    numbers: string[];
    decisions: string[];
    dates: string[];
    currency: string[];
    percentages: string[];
    other: string[];
  },
  role: string
): string {
  const parts: string[] = [];

  // Add decision-related content
  if (tokens.decisions.length > 0) {
    const uniqueDecisions = [...new Set(tokens.decisions)];
    parts.push(`Discussed: ${uniqueDecisions.join(", ")}`);
  }

  // Add financial metrics
  if (tokens.currency.length > 0 || tokens.percentages.length > 0) {
    const financial = [];
    if (tokens.currency.length > 0)
      financial.push(`Financial: ${tokens.currency.join(", ")}`);
    if (tokens.percentages.length > 0)
      financial.push(`Metrics: ${tokens.percentages.join(", ")}`);
    parts.push(financial.join(" | "));
  }

  // Add dates if present
  if (tokens.dates.length > 0) {
    const uniqueDates = [...new Set(tokens.dates)];
    parts.push(`Timeline: ${uniqueDates.join(", ")}`);
  }

  // Add other numbers if they seem significant
  if (tokens.numbers.length > 0) {
    const significantNumbers = tokens.numbers.filter(
      (n) => parseInt(n.replace(/,/g, "")) > 10
    );
    if (significantNumbers.length > 0) {
      parts.push(`Key Numbers: ${significantNumbers.join(", ")}`);
    }
  }

  if (parts.length === 0) {
    return `${role}: No specific business signals detected`;
  }

  return `${role}: ${parts.join(" | ")}`;
}

/**
 * Enhanced message summarization with better context and readability
 */
export function summarizeMessages(messages: ChatMessage[]): string {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "No messages to summarize";
  }

  const summaries: string[] = [];
  let currentBatch: ChatMessage[] = [];
  let currentRole: string | null = null;

  for (const message of messages) {
    if (!message || (message.role !== "user" && message.role !== "assistant")) {
      continue;
    }

    // Start new batch if role changes or if we have too many messages
    if (currentRole !== message.role || currentBatch.length >= 5) {
      if (currentBatch.length > 0) {
        const batchSummary = summarizeBatch(currentBatch, currentRole!);
        if (batchSummary) summaries.push(batchSummary);
      }
      currentBatch = [message];
      currentRole = message.role;
    } else {
      currentBatch.push(message);
    }
  }

  // Process final batch
  if (currentBatch.length > 0) {
    const batchSummary = summarizeBatch(currentBatch, currentRole!);
    if (batchSummary) summaries.push(batchSummary);
  }

  return summaries.length > 0
    ? summaries.join("\n")
    : "No meaningful content to summarize";
}

/**
 * Summarize a batch of messages from the same role
 */
function summarizeBatch(messages: ChatMessage[], role: string): string {
  if (messages.length === 0) return "";

  // Combine all content from the batch
  const combinedContent = messages.map((m) => m.content).join(" ");

  // Extract tokens with context
  const tokens = extractTokensWithContext(combinedContent);

  // Create meaningful summary
  const summary = createMeaningfulSummary(
    tokens,
    role === "user" ? "User" : "AI"
  );

  // Only return if we found meaningful content
  if (summary.includes("No specific business signals detected")) {
    return "";
  }

  return summary;
}

export default summarizeMessages;

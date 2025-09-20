// Centralized shared types for the application

export type AppRole = "user" | "assistant" | "system";

// Message shape used by providers and internal context assembly
export interface ProviderMessage {
  role: AppRole;
  content: string;
  roleContext?: string;
}

// Unified provider result contract
export interface ProviderResult {
  content: string;
  provider: "openai" | "gemini" | "groq" | "xai";
  confidence: number;
}

// Generic chat message used across summarizer and context assembly
export interface ChatMessage {
  role: AppRole;
  content: string;
  timestamp?: Date | string;
  roleContext?: string;
}

// Summaries
export interface SummaryKeyDatum {
  type: string;
  value: string;
}

export interface SummaryBlock {
  role: "system";
  content: string;
  keyData?: SummaryKeyDatum[];
  indexStart?: number;
  indexEnd?: number;
}

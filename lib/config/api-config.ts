/**
 * API configuration and environment variable management
 */

/**
 * Get available API keys from environment variables
 */
export function getAvailableAPIKeys() {
  const geminiKey = process.env.GEMINI_API_KEY;

  const xaiKey = process.env.XAI_API_KEY;

  const groqkey = process.env.GROQ_API_KEY;

  const openAIKey = process.env.OPENAI_API_KEY;

  return {
    gemini: geminiKey,
    xai: xaiKey,
    groq: groqkey,
    openai: openAIKey,
  };
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  gemini:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  xai: "https://api.x.ai/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
} as const;

/**
 * API generation configuration
 */
export const GENERATION_CONFIG = {
  gemini: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  xai: {
    temperature: 0.7,
    max_tokens: 1024,
  },
  groq: {},
  openai: {
    temperature: 0.3,
    max_tokens: 1500,
  },
} as const;

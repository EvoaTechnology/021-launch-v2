/**
 * Centralized logging utilities for AI chat functionality
 */
import { logger } from "./logger";

interface RequestBody {
  messages: Array<{
    role: string;
    content: string;
    roleContext?: string;
  }>;
  activeRole: string;
}

/**
 * Log request details
 */
export function logRequest(
  requestBody: RequestBody,
  lastMessage: string,
  roleContext: string
) {
  logger.debug("--- BACKEND /api/ai-chat RECEIVED REQUEST ---");
  logger.debug("Full request body:", requestBody);
  logger.debug("Received message:", lastMessage);
  logger.debug("Role context:", roleContext);
}

/**
 * Log API key availability
 */
export function logAPIKeys(apiKeys: { gemini?: string; xai?: string }) {
  logger.debug("API Keys available:", {
    gemini: !!apiKeys.gemini,
    xai: !!apiKeys.xai,
  });
}

/**
 * Log business classification result
 */
export function logBusinessClassification(isBusinessRelated: boolean) {
  logger.debug("Is business related:", isBusinessRelated);
}

/**
 * Log API provider attempt
 */
export function logProviderAttempt(provider: string) {
  logger.debug(`Trying ${provider} API...`);
}

/**
 * Log API provider success
 */
export function logProviderSuccess(provider: string, response?: string) {
  logger.debug(
    `${provider} response received${response ? `: ${response}` : ""}`
  );
}

/**
 * Log API provider failure
 */
export function logProviderFailure(
  provider: string,
  error: Error | string | unknown
) {
  logger.warn(`${provider} API failed:`, error);
}

/**
 * Log fallback usage
 */
export function logFallbackUsage() {
  logger.info("Using fallback response");
}

/**
 * Log error
 */
export function logError(
  error: Error | string | unknown,
  context: string = "AI chat"
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  if (stack) {
    logger.error(`[${context}]`, message, stack);
  } else {
    logger.error(`[${context}]`, message);
  }
}

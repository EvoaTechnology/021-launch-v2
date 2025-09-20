import { BUSINESS_KEYWORDS } from "../config/business-keywords";

/**
 * Check if a message is business-related based on keywords
 */
export function isBusinessRelated(message: string): boolean {
  return BUSINESS_KEYWORDS.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
}

/**
 * Get business keywords found in a message
 */
export function getBusinessKeywordsInMessage(message: string): string[] {
  return BUSINESS_KEYWORDS.filter((keyword) =>
    message.toLowerCase().includes(keyword)
  );
}

/**
 * Get business keyword count in a message
 */
export function getBusinessKeywordCount(message: string): number {
  return BUSINESS_KEYWORDS.filter((keyword) =>
    message.toLowerCase().includes(keyword)
  ).length;
}

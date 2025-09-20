/**
 * Type definitions for AI chat functionality
 */

/**
 * Role configuration interface defining the structure for each executive role
 */
export interface RoleConfig {
  title: string;
  expertise: string;
  guidance: string;
  domain: string[];
  keywords: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  activeRole?: string;
}

/**
 * Enhanced context interface for role switching and conversation continuity
 */
// export interface EnhancedContext {
//   conversationContext: any;
//   previousRoles: string[];
//   userIdea: string;
//   ideaScore: number | null;
//   isRoleSwitch: boolean;
//   previousPersona: string | null;
// }

/**
 * AI Chat request interface
 */
export interface AIChatRequest {
  messages: Message[];
  activeRole: string;
  userMessage?: string;
  isRoleSwitch: boolean;
}

/**
 * AI Chat response interface
 */
export interface AIChatResponse {
  content: string;
  isBusinessRelated?: boolean;
  confidence?: number;
  roleContext?: string;
  fallbackMode?: boolean;
  error?: boolean;
}

/**
 * API Provider interface for different AI services
 */
export interface APIProvider {
  callAPI(
    messages: [],
    apiKey: string,
    isBusinessRelated: boolean,
    directMode: boolean,
    roleContext: string
    // enhancedContext: EnhancedContext
  ): Promise<string>;
}

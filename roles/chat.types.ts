import type React from "react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  expertId?: string;
  fallbackMode?: boolean;
  isIntro?: boolean;
  followUpQuestions?: string[];
  keyInsights?: string[];
  actionItems?: string[];
  isBookmarked?: boolean;
  isTyping?: boolean;
  isBusinessRelated?: boolean;
  roleContext?: string;
  isValidator?: boolean;
  // Enhanced context tracking
  speakerPersona?: string; // "idea_validator", "ceo", "cto", etc.
  speakerName?: string; // "Idea Validator", "CEO", "CTO", etc.
  speakerIcon?: string; // Store icon name instead of React component
  speakerColor?: string;
  isRoleSwitch?: boolean; // true when switching between personas
  previousPersona?: string; // what persona was active before
}

export interface ChatSettings {
  fontSize: number;
  soundEnabled: boolean;
  typingIndicators: boolean;
  autoScroll: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  directMode: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  role: CRole;
  messageCount: number;
  lastMessage?: string;
}

export interface ConversationContext {
  userIdea: string;
  ideaScore: number | null;
  previousRoles: string[];
  roleHistory: Array<{
    role: string;
    timestamp: Date;
    keyInsights: string[];
  }>;
}

export interface CRole {
  id: string;
  name: string;
  title: string;
  icon: React.ReactNode; // Keep as React.ReactNode for display purposes
  color: string;
  description: string;
  expertise: string[];
  category: string;
}

export interface RoleCategory {
  name: string;
  icon: React.ReactNode; // Keep as React.ReactNode for display purposes
  color: string;
}

export type ConnectionStatus = "connected" | "fallback" | "error";
export type SidebarSection = "role" | "validator"; 
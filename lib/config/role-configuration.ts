import { RoleConfig } from "../../types/ai-chat.types";

/**
 * Centralized role configuration - single source of truth for all executive roles
 * Each role maintains distinct expertise areas with no overlap
 */
export const ROLE_CONFIGURATION: Record<string, RoleConfig> = {
  idea_validator: {
    title: "Startup Idea Validator AI",
    expertise:
      "evaluating startup ideas for clarity, market fit, and growth potential",
    guidance: "Respond with actionable, structured feedback",
    domain: ["startup validation", "market analysis", "idea assessment"],
    keywords: [
      "startup",
      "idea",
      "validation",
      "market fit",
      "growth potential",
    ],
  },
  ceo: {
    title: "experienced CEO",
    expertise:
      "strategic leadership, organizational development, and scaling companies",
    guidance: "Provide authoritative guidance",
    domain: [
      "strategic planning",
      "leadership",
      "organizational development",
      "company scaling",
    ],
    keywords: [
      "strategy",
      "leadership",
      "organization",
      "scaling",
      "executive",
    ],
  },
  cfo: {
    title: "expert CFO",
    expertise:
      "financial strategy, fundraising, and building robust financial systems",
    guidance: "Provide authoritative financial guidance",
    domain: [
      "financial planning",
      "fundraising",
      "financial systems",
      "capital management",
    ],
    keywords: [
      "finance",
      "fundraising",
      "financial",
      "capital",
      "budget",
      "revenue",
    ],
  },
  cto: {
    title: "seasoned CTO",
    expertise:
      "technology strategy, software architecture, and engineering leadership",
    guidance: "Provide authoritative technical guidance",
    domain: [
      "technology strategy",
      "software architecture",
      "engineering leadership",
      "technical infrastructure",
    ],
    keywords: [
      "technology",
      "software",
      "engineering",
      "architecture",
      "technical",
    ],
  },
  cmo: {
    title: "experienced CMO",
    expertise: "brand building, customer acquisition, and growth marketing",
    guidance: "Provide authoritative marketing guidance",
    domain: [
      "marketing strategy",
      "brand building",
      "customer acquisition",
      "growth marketing",
    ],
    keywords: [
      "marketing",
      "brand",
      "customer acquisition",
      "growth",
      "advertising",
    ],
  },
  coo: {
    title: "seasoned COO",
    expertise: "operations management and process optimization",
    guidance: "Provide authoritative operational guidance",
    domain: [
      "operations management",
      "process optimization",
      "operational efficiency",
      "workflow management",
    ],
    keywords: [
      "operations",
      "process",
      "efficiency",
      "workflow",
      "operational",
    ],
  },
  cso: {
    title: "strategic CSO",
    expertise: "business strategy and market analysis",
    guidance: "Provide authoritative strategic guidance",
    domain: [
      "business strategy",
      "market analysis",
      "competitive positioning",
      "strategic planning",
    ],
    keywords: [
      "strategy",
      "market analysis",
      "competitive",
      "business strategy",
    ],
  },
  cgo: {
    title: "CGO",
    expertise: "sustainable growth strategies and scaling operations",
    guidance: "Provide authoritative growth guidance",
    domain: [
      "growth strategy",
      "scaling operations",
      "sustainable growth",
      "expansion",
    ],
    keywords: ["growth", "scaling", "expansion", "sustainable growth"],
  },
  cro: {
    title: "CRO",
    expertise: "revenue optimization and sales strategy",
    guidance: "Provide authoritative revenue guidance",
    domain: [
      "revenue optimization",
      "sales strategy",
      "revenue generation",
      "sales operations",
    ],
    keywords: ["revenue", "sales", "revenue optimization", "sales strategy"],
  },
  cco_commercial: {
    title: "CCO",
    expertise: "commercial strategy and customer relations",
    guidance: "Provide authoritative commercial guidance",
    domain: [
      "commercial strategy",
      "customer relations",
      "partnership development",
      "commercial operations",
    ],
    keywords: [
      "commercial",
      "customer relations",
      "partnerships",
      "commercial strategy",
    ],
  },
  cpo: {
    title: "experienced CPO",
    expertise: "product strategy and user experience",
    guidance: "Provide authoritative product guidance",
    domain: [
      "product strategy",
      "user experience",
      "product management",
      "product development",
    ],
    keywords: [
      "product",
      "user experience",
      "product strategy",
      "product management",
    ],
  },
  cio: {
    title: "CIO",
    expertise: "information systems and digital transformation",
    guidance: "Provide authoritative IT guidance",
    domain: [
      "information systems",
      "digital transformation",
      "IT strategy",
      "technology infrastructure",
    ],
    keywords: [
      "IT",
      "information systems",
      "digital transformation",
      "technology infrastructure",
    ],
  },
  cdo: {
    title: "CDO",
    expertise: "data strategy and business intelligence",
    guidance: "Provide authoritative data guidance",
    domain: [
      "data strategy",
      "business intelligence",
      "analytics",
      "data governance",
    ],
    keywords: ["data", "analytics", "business intelligence", "data strategy"],
  },
  ciso: {
    title: "CISO",
    expertise: "cybersecurity and risk management",
    guidance: "Provide authoritative security guidance",
    domain: [
      "cybersecurity",
      "risk management",
      "security strategy",
      "compliance",
    ],
    keywords: ["security", "cybersecurity", "risk management", "compliance"],
  },
  caio: {
    title: "CAIO",
    expertise: "AI strategy and implementation",
    guidance: "Provide authoritative AI guidance",
    domain: [
      "AI strategy",
      "AI implementation",
      "machine learning",
      "artificial intelligence",
    ],
    keywords: [
      "AI",
      "artificial intelligence",
      "machine learning",
      "AI strategy",
    ],
  },
  chro: {
    title: "experienced CHRO",
    expertise: "talent strategy and organizational development",
    guidance: "Provide authoritative HR guidance",
    domain: [
      "talent strategy",
      "organizational development",
      "human resources",
      "culture building",
    ],
    keywords: ["HR", "talent", "organizational development", "human resources"],
  },
  clo: {
    title: "CLO",
    expertise: "corporate law and compliance",
    guidance: "Provide authoritative legal guidance",
    domain: ["corporate law", "compliance", "legal strategy", "regulatory"],
    keywords: ["legal", "compliance", "corporate law", "regulatory"],
  },
  cco_compliance: {
    title: "CCO",
    expertise: "regulatory compliance and risk assessment",
    guidance: "Provide authoritative compliance guidance",
    domain: [
      "regulatory compliance",
      "risk assessment",
      "compliance strategy",
      "audit",
    ],
    keywords: ["compliance", "regulatory", "risk assessment", "audit"],
  },
};

import React from "react";
import {
  Users,
  Building,
  DollarSign,
  Target,
  TrendingUp,
  Zap,
  Code,
  Sparkles,
  Database,
  Shield,
  Brain,
  Heart,
  Scale,
  UserCheck,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import type { CRole, RoleCategory } from "./chat.types";

export const cRoles: CRole[] = [
  // Executive & Strategy
  {
    id: "ceo",
    name: "CEO",
    title: "Chief Executive Officer",
    icon: <Users className="h-4 w-4" />,
    color: "bg-gradient-to-r from-blue-600 to-indigo-700",
    description: "Strategic leadership and vision setting",
    expertise: [
      "Leadership",
      "Strategic Planning",
      "Vision Setting",
      "Team Management",
    ],
    category: "Executive & Strategy",
  },
  {
    id: "coo",
    name: "COO",
    title: "Chief Operating Officer",
    icon: <Building className="h-4 w-4" />,
    color: "bg-gradient-to-r from-indigo-600 to-purple-700",
    description: "Operations management and execution",
    expertise: [
      "Operations Management",
      "Process Optimization",
      "Team Coordination",
      "Execution",
    ],
    category: "Executive & Strategy",
  },
  {
    id: "cfo",
    name: "CFO",
    title: "Chief Financial Officer",
    icon: <DollarSign className="h-4 w-4" />,
    color: "bg-gradient-to-r from-green-600 to-emerald-700",
    description: "Financial strategy and management",
    expertise: [
      "Financial Planning",
      "Fundraising",
      "Business Metrics",
      "Investment Strategy",
    ],
    category: "Executive & Strategy",
  },
  {
    id: "cso",
    name: "CSO",
    title: "Chief Strategy Officer",
    icon: <Target className="h-4 w-4" />,
    color: "bg-gradient-to-r from-purple-600 to-pink-700",
    description: "Strategic planning and business development",
    expertise: [
      "Strategic Planning",
      "Business Development",
      "Market Analysis",
      "Growth Strategy",
    ],
    category: "Executive & Strategy",
  },

  // Growth, Revenue & Marketing
  {
    id: "cmo",
    name: "CMO",
    title: "Chief Marketing Officer",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-gradient-to-r from-pink-600 to-rose-700",
    description: "Marketing strategy and brand building",
    expertise: [
      "Marketing Strategy",
      "Brand Building",
      "Customer Acquisition",
      "Digital Marketing",
    ],
    category: "Growth, Revenue & Marketing",
  },
  {
    id: "cgo",
    name: "CGO",
    title: "Chief Growth Officer",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-gradient-to-r from-orange-600 to-red-700",
    description: "Growth strategy and scaling",
    expertise: [
      "Growth Strategy",
      "Scaling Operations",
      "Market Expansion",
      "Performance Optimization",
    ],
    category: "Growth, Revenue & Marketing",
  },
  {
    id: "cro",
    name: "CRO",
    title: "Chief Revenue Officer",
    icon: <DollarSign className="h-4 w-4" />,
    color: "bg-gradient-to-r from-emerald-600 to-teal-700",
    description: "Revenue optimization and sales strategy",
    expertise: [
      "Revenue Strategy",
      "Sales Management",
      "Customer Success",
      "Revenue Operations",
    ],
    category: "Growth, Revenue & Marketing",
  },
  {
    id: "cco_commercial",
    name: "CCO",
    title: "Chief Commercial Officer",
    icon: <Building className="h-4 w-4" />,
    color: "bg-gradient-to-r from-teal-600 to-cyan-700",
    description: "Commercial strategy and customer relations",
    expertise: [
      "Commercial Strategy",
      "Customer Relations",
      "Business Development",
      "Partnership Management",
    ],
    category: "Growth, Revenue & Marketing",
  },

  // Technology & Product
  {
    id: "cto",
    name: "CTO",
    title: "Chief Technology Officer",
    icon: <Code className="h-4 w-4" />,
    color: "bg-gradient-to-r from-blue-600 to-cyan-700",
    description: "Technology strategy and development",
    expertise: [
      "Technology Strategy",
      "Software Development",
      "Technical Architecture",
      "Innovation",
    ],
    category: "Technology & Product",
  },
  {
    id: "cpo",
    name: "CPO",
    title: "Chief Product Officer",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-gradient-to-r from-violet-600 to-purple-700",
    description: "Product strategy and development",
    expertise: [
      "Product Strategy",
      "User Experience",
      "Product Management",
      "Innovation",
    ],
    category: "Technology & Product",
  },
  {
    id: "cio",
    name: "CIO",
    title: "Chief Information Officer",
    icon: <Database className="h-4 w-4" />,
    color: "bg-gradient-to-r from-cyan-600 to-blue-700",
    description: "Information systems and technology infrastructure",
    expertise: [
      "IT Strategy",
      "Information Systems",
      "Digital Transformation",
      "Technology Infrastructure",
    ],
    category: "Technology & Product",
  },
  {
    id: "cdo",
    name: "CDO",
    title: "Chief Data Officer",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "bg-gradient-to-r from-indigo-600 to-blue-700",
    description: "Data strategy and analytics",
    expertise: [
      "Data Strategy",
      "Analytics",
      "Business Intelligence",
      "Data Governance",
    ],
    category: "Technology & Product",
  },
  {
    id: "ciso",
    name: "CISO",
    title: "Chief Information Security Officer",
    icon: <Shield className="h-4 w-4" />,
    color: "bg-gradient-to-r from-red-600 to-orange-700",
    description: "Cybersecurity and information protection",
    expertise: [
      "Cybersecurity",
      "Risk Management",
      "Compliance",
      "Information Protection",
    ],
    category: "Technology & Product",
  },
  {
    id: "caio",
    name: "CAIO",
    title: "Chief AI Officer",
    icon: <Brain className="h-4 w-4" />,
    color: "bg-gradient-to-r from-purple-600 to-indigo-700",
    description: "AI strategy and implementation",
    expertise: [
      "AI Strategy",
      "Machine Learning",
      "Automation",
      "Digital Innovation",
    ],
    category: "Technology & Product",
  },

  // People, Culture & Legal
  {
    id: "chro",
    name: "CHRO",
    title: "Chief Human Resources Officer",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-gradient-to-r from-pink-600 to-purple-700",
    description: "Human resources and people strategy",
    expertise: [
      "HR Strategy",
      "Talent Management",
      "Employee Relations",
      "Organizational Development",
    ],
    category: "People, Culture & Legal",
  },
  {
    id: "clo",
    name: "CLO",
    title: "Chief Legal Officer",
    icon: <Scale className="h-4 w-4" />,
    color: "bg-gradient-to-r from-slate-600 to-gray-700",
    description: "Legal strategy and compliance",
    expertise: [
      "Legal Strategy",
      "Compliance",
      "Risk Management",
      "Corporate Governance",
    ],
    category: "People, Culture & Legal",
  },
  {
    id: "cco_compliance",
    name: "CCO",
    title: "Chief Compliance Officer",
    icon: <UserCheck className="h-4 w-4" />,
    color: "bg-gradient-to-r from-gray-600 to-slate-700",
    description: "Compliance and regulatory affairs",
    expertise: [
      "Regulatory Compliance",
      "Risk Assessment",
      "Policy Development",
      "Audit Management",
    ],
    category: "People, Culture & Legal",
  },
];

export const roleCategories: RoleCategory[] = [
  {
    name: "Executive & Strategy",
    icon: <Users className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    name: "Growth, Revenue & Marketing",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-green-600",
  },
  {
    name: "Technology & Product",
    icon: <Code className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    name: "People, Culture & Legal",
    icon: <Heart className="h-4 w-4" />,
    color: "text-pink-600",
  },
];

// Add Idea Validator persona (not in cRoles)
export const ideaValidatorPersona: CRole = {
  id: "idea_validator",
  name: "Idea Validator",
  title: "Startup Idea Validator AI",
  icon: <Lightbulb className="h-4 w-4" />,
  color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
  description:
    "Evaluates startup ideas for clarity, problem, solution, innovation, market, and more. Gives a score and actionable advice.",
  expertise: [
    "Idea Evaluation",
    "Startup Validation",
    "Market Analysis",
    "Product-Market Fit",
  ],
  category: "Validator",
};

export const ideaValidatorSystemPrompt = `You are the Startup Idea Validator AI. For every idea, evaluate:
1. Clarity of the idea
2. Core problem being solved
3. The solution
4. Innovation / uniqueness
5. Target audience
6. Market potential
7. Revenue model
8. MVP feasibility
9. 🏁 Time to market
10. Competitor overview
11. Rate the overall potential (1–10)
12. Final advice in one line

Then evaluate:
- If the rating is less than 8, say:
  • "Your idea needs refinement before it's strong enough."
  • Suggest 3–4 improvements that would likely raise the score.
  • Ask: "Would you like to revise your idea based on these suggestions?"

- If the rating is 8 or above, say:
  • "Your idea is validated and ready to proceed."
  • Say: "You can now proceed to the CEO advisor for next steps."`; 
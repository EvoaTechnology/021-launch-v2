// import { EnhancedContext } from "../../types/ai-chat.types";
// import { getRoleConfig } from "./role-service";

/**
 * Generates fallback response using template system
 * Eliminates redundancy while preserving role-specific expertise
 */
// export function generateFallbackResponse(
//   message: string,
//   isBusinessRelated: boolean,
//   directMode: boolean,
//   roleContext: string,
//   enhancedContext: EnhancedContext
// ): string {
//   const role = getRoleConfig(roleContext);

//   // Build context prefix for role switching
//   let contextPrefix = "";
//   if (
//     enhancedContext.isRoleSwitch &&
//     enhancedContext.previousRoles.length > 0
//   ) {
//     const previousRoleNames = enhancedContext.previousRoles
//       .map((role) =>
//         role === "idea_validator" ? "Idea Validator" : role.toUpperCase()
//       )
//       .join(", ");

//     contextPrefix = `Based on the previous consultation with ${previousRoleNames}${
//       enhancedContext.userIdea
//         ? ` regarding your idea: "${enhancedContext.userIdea}"`
//         : ""
//     }${
//       enhancedContext.ideaScore
//         ? ` (validated with score: ${enhancedContext.ideaScore}/10)`
//         : ""
//     }, `;
//     console.log(`context prefix : ${contextPrefix}`)
//   }
//   console.log(`enhancedContext.userIdea : ${enhancedContext.userIdea}`)

//   // Generate role-specific response using template
//   if (isBusinessRelated) {
//     return `${contextPrefix}From a ${
//       role.domain[0]
//     } perspective, this requires ${
//       role.domain[1] || "systematic analysis"
//     } of ${role.domain[2] || "key considerations"}. ${
//       role.domain[3]
//         ? `Critical ${role.domain[3]} considerations include `
//         : "Key considerations include "
//     }${role.keywords.slice(0, 3).join(", ")}, and ${
//       role.keywords[3] || "strategic planning"
//     }. My recommended approach: 1) ${
//       role.domain[0]
//     } assessment and analysis, 2) Develop ${
//       role.domain[1] || "strategic"
//     } framework, 3) Implement ${
//       role.domain[2] || "operational"
//     } improvements, 4) Establish ${
//       role.domain[3] || "performance"
//     } monitoring, 5) Create ${
//       role.keywords[0] || "continuous"
//     } optimization processes. This methodology has consistently delivered ${
//       role.keywords[1] || "measurable"
//     } results across various ${role.keywords[2] || "business"} contexts.`;
//   } else {
//     return `${contextPrefix}That's an interesting question! While my expertise is in ${
//       role.expertise
//     }, I'm happy to help. I'd be most valuable discussing ${role.domain
//       .slice(0, 2)
//       .join(", ")}, or ${role.keywords.slice(0, 2).join(" and ")}. Is there a ${
//       role.domain[0]
//     } aspect to this we could explore?`;
//   }
// }

import { z } from "zod";

export const RoleEnum = z.enum(["user", "assistant", "system"]);

export const MessageSchema = z.object({
  id: z.string().optional(),
  role: RoleEnum,
  content: z.string().min(1),
  roleContext: z.string().optional(),
});

export const AIChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1),
  activeRole: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

export type AIChatBody = z.infer<typeof AIChatBodySchema>;

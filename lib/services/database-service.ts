import { connectToDatabase } from "../connectToDB";
import User from "../../model/User";
import Idea from "../../model/Idea";
import ChatSession from "../../model/ChatSession";
import Chat from "../../model/Chat";
import ChatSummary from "../../model/ChatSummary";
import mongoose from "mongoose";
import { logger, logContextAssembly } from "../utils/logger";

export class DatabaseService {
  // User operations
  static async createUser(userData: {
    name: string;
    email: string;
    password?: string;
  }) {
    await connectToDatabase();
    const user = new User(userData);
    return await user.save();
  }

  static async getUserByEmail(email: string) {
    await connectToDatabase();
    return await User.findOne({ email });
  }

  static async updateUserIdeaValidation(
    userId: string,
    ideaId: string,
    validated: boolean
  ) {
    await connectToDatabase();
    return await User.findByIdAndUpdate(
      userId,
      { ideaValidated: validated, ideaId: new mongoose.Types.ObjectId(ideaId) },
      { new: true }
    );
  }

  // Idea operations
  static async createIdea(ideaData: {
    title: string;
    problem: string;
    solution: string;
    marketSize: string;
    businessModel: string;
    competitors: string;
    differentiators: string;
  }) {
    await connectToDatabase();
    const idea = new Idea(ideaData);
    return await idea.save();
  }

  static async getIdeaById(ideaId: string) {
    await connectToDatabase();
    return await Idea.findById(ideaId);
  }

  static async updateIdeaValidationStatus(
    ideaId: string,
    status: "pending" | "validated"
  ) {
    await connectToDatabase();
    return await Idea.findByIdAndUpdate(
      ideaId,
      { ideaValidationStatus: status },
      { new: true }
    );
  }

  // Chat Session operations
  static async createChatSession(sessionData: {
    userId: string;
    topic: string;
  }) {
    await connectToDatabase();
    const session = new ChatSession({
      ...sessionData,
      userId: sessionData.userId,
    });
    return await session.save();
  }

  static async getChatSessionsByUserId(userId: string) {
    await connectToDatabase();
    return await ChatSession.find({
      userId: userId,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getChatSessionById(sessionId: string) {
    await connectToDatabase();
    return await ChatSession.findById(sessionId).lean();
  }

  static async updateChatSessionTopic(sessionId: string, topic: string) {
    await connectToDatabase();
    return await ChatSession.findByIdAndUpdate(
      sessionId,
      { topic },
      { new: true }
    );
  }

  // progress score removed from chat sessions

  static async deleteChatSession(sessionId: string) {
    await connectToDatabase();
    // First delete all chats in this session
    await Chat.deleteMany({
      sessionId: sessionId,
    });
    // Then delete the session
    return await ChatSession.findByIdAndDelete(sessionId);
  }

  // Chat Message operations
  static async createChatMessage(messageData: {
    content: string;
    role: "user" | "ai";
    sessionId: string;
  }) {
    await connectToDatabase();
    const message = new Chat({
      ...messageData,
      sessionId: messageData.sessionId,
    });
    return await message.save();
  }

  static async getChatMessagesBySessionId(sessionId: string) {
    await connectToDatabase();
    return await Chat.find({
      sessionId: sessionId,
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  static async getChatMessageById(messageId: string) {
    await connectToDatabase();
    return await Chat.findById(messageId);
  }

  // Bulk operations for chat sessions
  static async createChatSessionWithInitialMessage(sessionData: {
    userId: string;
    topic: string;
    initialMessage: {
      content: string;
      role: "user" | "ai";
    };
  }) {
    await connectToDatabase();

    // Create the session
    const session = new ChatSession({
      userId: sessionData.userId,
      topic: sessionData.topic,
    });
    const savedSession = await session.save();

    // Create the initial message
    const message = new Chat({
      content: sessionData.initialMessage.content,
      role: sessionData.initialMessage.role,
      sessionId: savedSession.id,
    });
    await message.save();

    return savedSession;
  }

  // Get complete chat data for a session
  static async getCompleteChatSession(sessionId: string) {
    await connectToDatabase();

    const session = await ChatSession.findById(sessionId).lean();
    if (!session) return null;

    const messages = await Chat.find({ sessionId: sessionId })
      .sort({ createdAt: 1 })
      .lean();

    const summaries = await ChatSummary.find({ sessionId: sessionId })
      .sort({ indexStart: 1 })
      .lean();

    return {
      session,
      messages,
      summaries,
    };
  }

  // Summary operations
  static async createChatSummary(data: {
    sessionId: string;
    content: string;
    keyData: Array<{ type: string; value: string }>;
    indexStart: number;
    indexEnd: number;
  }) {
    await connectToDatabase();
    const doc = new ChatSummary({ ...data, role: "system_summary" });
    return await doc.save();
  }

  static async getSummariesBySessionId(sessionId: string) {
    await connectToDatabase();
    return await ChatSummary.find({ sessionId }).sort({ indexStart: 1 }).lean();
  }

  /**
   * Check if a summary range would overlap with existing summaries
   */
  static async checkSummaryOverlap(
    sessionId: string,
    indexStart: number,
    indexEnd: number
  ): Promise<{ hasOverlap: boolean; overlappingSummaries: any[] }> {
    await connectToDatabase();

    const existingSummaries = await ChatSummary.find({
      sessionId,
      $or: [
        // Check if new range overlaps with existing ranges
        { indexStart: { $lte: indexEnd, $gte: indexStart } },
        { indexEnd: { $gte: indexStart, $lte: indexEnd } },
        // Check if existing range completely contains new range
        { indexStart: { $lte: indexStart }, indexEnd: { $gte: indexEnd } },
      ],
    }).lean();

    return {
      hasOverlap: existingSummaries.length > 0,
      overlappingSummaries: existingSummaries,
    };
  }

  /**
   * Clean up overlapping or duplicate summaries
   */
  static async cleanupOverlappingSummaries(
    sessionId: string
  ): Promise<{ cleanedCount: number }> {
    await connectToDatabase();

    const summaries = await ChatSummary.find({ sessionId })
      .sort({ indexStart: 1 })
      .lean();
    let cleanedCount = 0;

    for (let i = 0; i < summaries.length; i++) {
      for (let j = i + 1; j < summaries.length; j++) {
        const summary1 = summaries[i];
        const summary2 = summaries[j];

        // Check for overlap
        if (
          summary1.indexStart <= summary2.indexEnd &&
          summary1.indexEnd >= summary2.indexStart
        ) {
          // Keep the one with more content, delete the other
          const toDelete =
            summary1.content.length >= summary2.content.length
              ? summary2._id
              : summary1._id;
          await ChatSummary.findByIdAndDelete(toDelete);
          cleanedCount++;

          logger.warn("🧹 [DATABASE] Cleaned up overlapping summary", {
            sessionId,
            keptSummary:
              summary1.content.length >= summary2.content.length
                ? summary1._id
                : summary2._id,
            deletedSummary: toDelete,
            overlapRange: {
              start: Math.max(summary1.indexStart, summary2.indexStart),
              end: Math.min(summary1.indexEnd, summary2.indexEnd),
            },
          });
        }
      }
    }

    return { cleanedCount };
  }

  /**
   * Get summary statistics for monitoring and debugging
   */
  static async getSummaryStats(sessionId: string): Promise<{
    totalSummaries: number;
    totalContentLength: number;
    averageContentLength: number;
    hasOverlaps: boolean;
    overlapCount: number;
    indexRanges: Array<{ start: number; end: number; content: string }>;
    qualityIssues: string[];
  }> {
    await connectToDatabase();

    const summaries = await ChatSummary.find({ sessionId })
      .sort({ indexStart: 1 })
      .lean();
    const totalSummaries = summaries.length;
    const totalContentLength = summaries.reduce(
      (sum, s) => sum + (s.content?.length || 0),
      0
    );
    const averageContentLength =
      totalSummaries > 0 ? totalContentLength / totalSummaries : 0;

    // Check for overlaps
    let overlapCount = 0;
    let hasOverlaps = false;
    for (let i = 0; i < summaries.length; i++) {
      for (let j = i + 1; j < summaries.length; j++) {
        const summary1 = summaries[i];
        const summary2 = summaries[j];
        if (
          summary1.indexStart <= summary2.indexEnd &&
          summary1.indexEnd >= summary2.indexStart
        ) {
          overlapCount++;
          hasOverlaps = true;
        }
      }
    }

    // Check for quality issues
    const qualityIssues: string[] = [];
    summaries.forEach((summary, index) => {
      if (summary.content.length < 50) {
        qualityIssues.push(
          `Summary ${index}: Too short (${summary.content.length} chars)`
        );
      }
      if (
        summary.content.includes("No meaningful content") ||
        summary.content.includes("No specific business signals")
      ) {
        qualityIssues.push(`Summary ${index}: Low quality content`);
      }
      if (summary.indexStart === summary.indexEnd) {
        qualityIssues.push(
          `Summary ${index}: Zero range (${summary.indexStart}-${summary.indexEnd})`
        );
      }
    });

    return {
      totalSummaries,
      totalContentLength,
      averageContentLength,
      hasOverlaps,
      overlapCount,
      indexRanges: summaries.map((s) => ({
        start: s.indexStart,
        end: s.indexEnd,
        content: s.content.substring(0, 100) + "...",
      })),
      qualityIssues,
    };
  }

  static async deleteChatsByIds(
    messageIds: string[]
  ): Promise<{ deletedCount: number }> {
    await connectToDatabase();
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return { deletedCount: 0 };
    }
    const result = await Chat.deleteMany({ _id: { $in: messageIds } });
    const deletedCount =
      (result as { deletedCount?: number }).deletedCount ?? 0;
    return { deletedCount };
  }

  /**
   * Returns merged chat context: all summary blocks (chronological) followed by last-N raw messages.
   * - Summaries are emitted as system messages with optional keyData preserved
   * - Raw messages are mapped to provider roles (ai -> assistant)
   * - Read-only; does not modify DB
   */
  static async getMergedChatContext(
    sessionId: string,
    lastN: number = 20,
    maxTokenBudget: number = 3000
  ): Promise<
    Array<{
      role: "user" | "assistant" | "system";
      content: string;
      keyData?: Array<{ type: string; value: string }>;
    }>
  > {
    await connectToDatabase();

    const summaries = await ChatSummary.find({ sessionId })
      .sort({ indexStart: 1 })
      .lean();

    const recent = await Chat.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(lastN)
      .lean();
    const recentChrono = [...recent].reverse();

    let merged: Array<{
      role: "user" | "assistant" | "system";
      content: string;
      keyData?: Array<{ type: string; value: string }>;
    }> = [];

    for (const s of summaries || []) {
      if (!s || typeof s.content !== "string") continue;
      merged.push({
        role: "system",
        content: s.content,
        keyData:
          (s as unknown as { keyData?: Array<{ type: string; value: string }> })
            .keyData || [],
      });
    }

    for (const m of recentChrono || []) {
      if (!m || typeof m.content !== "string") continue;
      const role =
        m.role === "ai" ? "assistant" : (m.role as "user" | "assistant");
      merged.push({ role, content: m.content });
    }

    // Validate summaries continuity (no overlaps/gaps) and log if issues
    try {
      let lastEnd = -1;
      let overlaps = 0;
      for (const s of summaries || []) {
        if (typeof s.indexStart !== "number" || typeof s.indexEnd !== "number")
          continue;
        if (lastEnd >= 0 && s.indexStart <= lastEnd) overlaps++;
        lastEnd = s.indexEnd;
      }
      if (overlaps > 0)
        logger.warn("Summary index overlaps detected", { sessionId, overlaps });
      // Gaps are allowed; we rely on raw last-N to provide continuity
    } catch {}

    // Token budget enforcement: rough estimate 1 token ≈ 4 chars
    const estimateTokens = (text: string) => Math.ceil((text?.length || 0) / 4);
    const totalTokens = merged.reduce(
      (sum, m) => sum + estimateTokens(m.content),
      0
    );
    if (totalTokens > maxTokenBudget) {
      // Drop oldest summaries first
      let dropped = 0;
      const summariesIdxs = merged
        .map((m, i) => ({ i, isSummary: m.role === "system" }))
        .filter((x) => x.isSummary)
        .map((x) => x.i);
      for (const idx of summariesIdxs) {
        if (merged.length === 0) break;
        merged[idx].content = ""; // mark for removal
        dropped++;
        if (
          merged.reduce((sum, m) => sum + estimateTokens(m.content), 0) <=
          maxTokenBudget
        )
          break;
      }
      merged = merged.filter((m) => m.content !== "");
      logContextAssembly({
        summariesCount: summaries?.length || 0,
        rawCount: recentChrono?.length || 0,
        droppedSummaries: dropped,
        estTokens: merged.reduce(
          (sum, m) => sum + estimateTokens(m.content),
          0
        ),
        budget: maxTokenBudget,
      });
    } else {
      try {
        logContextAssembly({
          summariesCount: summaries?.length || 0,
          rawCount: recentChrono?.length || 0,
          droppedSummaries: 0,
          estTokens: totalTokens,
          budget: maxTokenBudget,
        });
      } catch {}
    }

    return merged;
  }
}

/**
 * Pure helper to assemble merged context from provided arrays.
 * Useful for unit testing without DB.
 */
export function assembleMergedChatContext(
  summaries: Array<{
    content: string;
    indexStart?: number;
    indexEnd?: number;
    keyData?: Array<{ type: string; value: string }>;
  }> = [],
  rawChrono: Array<{ role: "user" | "ai" | "assistant"; content: string }> = [],
  lastN: number = 20,
  maxTokenBudget: number = 3000
): Array<{
  role: "user" | "assistant" | "system";
  content: string;
  keyData?: Array<{ type: string; value: string }>;
}> {
  let merged: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    keyData?: Array<{ type: string; value: string }>;
  }> = [];

  for (const s of summaries || []) {
    if (!s || typeof s.content !== "string") continue;
    merged.push({
      role: "system",
      content: s.content,
      keyData: s.keyData || [],
    });
  }

  const rawTail = rawChrono.slice(-lastN);
  for (const m of rawTail || []) {
    if (!m || typeof m.content !== "string") continue;
    const role =
      m.role === "ai" ? "assistant" : (m.role as "user" | "assistant");
    merged.push({ role, content: m.content });
  }

  try {
    let lastEnd = -1;
    let overlaps = 0;
    for (const s of summaries || []) {
      const start = typeof s.indexStart === "number" ? s.indexStart : undefined;
      const end = typeof s.indexEnd === "number" ? s.indexEnd : undefined;
      if (start === undefined || end === undefined) continue;
      if (lastEnd >= 0 && start <= lastEnd) overlaps++;
      lastEnd = end;
    }
    if (overlaps > 0)
      logger.warn("Summary index overlaps detected", { overlaps });
  } catch {}

  const estimateTokens = (text: string) => Math.ceil((text?.length || 0) / 4);
  const tokens = () =>
    merged.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  if (tokens() > maxTokenBudget) {
    let dropped = 0;
    for (let i = 0; i < merged.length && tokens() > maxTokenBudget; i++) {
      if (merged[i].role === "system") {
        merged[i].content = "";
        dropped++;
      }
    }
    merged = merged.filter((m) => m.content !== "");
    logContextAssembly({
      summariesCount: summaries?.length || 0,
      rawCount: rawTail?.length || 0,
      droppedSummaries: dropped,
      estTokens: tokens(),
      budget: maxTokenBudget,
    });
  } else {
    try {
      logContextAssembly({
        summariesCount: summaries?.length || 0,
        rawCount: rawTail?.length || 0,
        droppedSummaries: 0,
        estTokens: tokens(),
        budget: maxTokenBudget,
      });
    } catch {}
  }

  return merged;
}

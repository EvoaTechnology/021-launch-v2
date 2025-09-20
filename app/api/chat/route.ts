import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "../../../lib/services/database-service";
import { validateAndSanitizeFreeText } from "../../../lib/utils/input-validation";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";
import { buildRateKey, checkRateLimit } from "../../../lib/utils/rate-limit";

async function requireAuth() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return { ok: false as const, status: 401, error: "Unauthorized" };
    }
    return { ok: true as const, user };
  } catch (err) {
    return { ok: false as const, status: 500, error: "Auth check failed" };
  }
}

/**
 * Chat CRUD Route
 *
 * Responsibilities
 * - Enforces Supabase-authenticated access and user ownership
 * - Exposes CRUD operations for sessions and messages
 * - Applies per-user/IP rate limits for creation endpoints
 * - Sanitizes free-text inputs ('topic' and 'content') prior to DB writes
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const authUserId = auth.user.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (String(userId) !== String(authUserId)) {
      return NextResponse.json(
        { error: "Forbidden: userId does not match authenticated user" },
        { status: 403 }
      );
    }

    if (sessionId) {
      // Get specific chat session with messages, but verify ownership
      const chatData = await DatabaseService.getCompleteChatSession(sessionId);
      if (!chatData) {
        return NextResponse.json(
          { error: "Chat session not found" },
          { status: 404 }
        );
      }
      if (String(chatData.session.userId) !== String(authUserId)) {
        return NextResponse.json(
          { error: "Unauthorized to access this session" },
          { status: 403 }
        );
      }
      return NextResponse.json(chatData);
    } else {
      // Get all chat sessions for user
      const sessions = await DatabaseService.getChatSessionsByUserId(
        authUserId
      );
      return NextResponse.json(sessions);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error("Error in chat GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const authUserId = auth.user.id;
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "createSession":
        {
          // Rate limit per user/IP for session creation
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown-ip";
          const rateKey = buildRateKey(["chat:createSession", authUserId, ip]);
          // Capacity 5, refill ~1 per 15s (~4/min)
          const rl = checkRateLimit(rateKey, {
            capacity: 5,
            refillRatePerSec: 1 / 15,
          });
          if (!rl.allowed) {
            return NextResponse.json(
              {
                error:
                  "Too many new chats. Please wait a few seconds and try again.",
                retryAfterMs: rl.retryAfterMs,
              },
              { status: 429 }
            );
          }
        }
        if (!data.userId || typeof data.userId !== "string") {
          return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
          );
        }
        if (String(data.userId) !== String(authUserId)) {
          return NextResponse.json(
            { error: "Forbidden: userId does not match authenticated user" },
            { status: 403 }
          );
        }
        const topicResult1 = validateAndSanitizeFreeText(data.topic, "topic", {
          required: true,
        });
        if (!topicResult1.ok) {
          return NextResponse.json(
            { error: topicResult1.error },
            { status: 400 }
          );
        }
        const session = await DatabaseService.createChatSession({
          userId: data.userId,
          topic: topicResult1.value,
        });
        return NextResponse.json(session);

      case "createSessionWithMessage":
        {
          // Rate limit per user/IP for session creation with initial message
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown-ip";
          const rateKey = buildRateKey([
            "chat:createSessionWithMessage",
            authUserId,
            ip,
          ]);
          const rl = checkRateLimit(rateKey, {
            capacity: 5,
            refillRatePerSec: 1 / 15,
          });
          if (!rl.allowed) {
            return NextResponse.json(
              {
                error:
                  "Too many new chats. Please wait a few seconds and try again.",
                retryAfterMs: rl.retryAfterMs,
              },
              { status: 429 }
            );
          }
        }
        if (!data.userId || typeof data.userId !== "string") {
          return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
          );
        }
        if (String(data.userId) !== String(authUserId)) {
          return NextResponse.json(
            { error: "Forbidden: userId does not match authenticated user" },
            { status: 403 }
          );
        }
        const topicResult2 = validateAndSanitizeFreeText(data.topic, "topic", {
          required: true,
        });
        if (!topicResult2.ok) {
          return NextResponse.json(
            { error: topicResult2.error },
            { status: 400 }
          );
        }
        const contentResult1 = validateAndSanitizeFreeText(
          data.initialMessage?.content,
          "initialMessage.content",
          { required: true }
        );
        if (!contentResult1.ok) {
          return NextResponse.json(
            { error: contentResult1.error },
            { status: 400 }
          );
        }
        const sessionWithMessage =
          await DatabaseService.createChatSessionWithInitialMessage({
            userId: data.userId,
            topic: topicResult2.value,
            initialMessage: {
              ...data.initialMessage,
              content: contentResult1.value,
            },
          });
        return NextResponse.json(sessionWithMessage);

      case "addMessage":
        {
          // Rate limit per user/IP for message creation
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown-ip";
          const rateKey = buildRateKey(["chat:addMessage", authUserId, ip]);
          // Capacity 20, refill ~0.5/s (~30/min)
          const rl = checkRateLimit(rateKey, {
            capacity: 20,
            refillRatePerSec: 0.5,
          });
          if (!rl.allowed) {
            return NextResponse.json(
              {
                error: "You're sending messages too quickly. Please slow down.",
                retryAfterMs: rl.retryAfterMs,
              },
              { status: 429 }
            );
          }
        }
        if (!data.sessionId || typeof data.sessionId !== "string") {
          return NextResponse.json(
            { error: "sessionId is required" },
            { status: 400 }
          );
        }
        const contentResult2 = validateAndSanitizeFreeText(
          data.content,
          "content",
          { required: true }
        );
        if (!contentResult2.ok) {
          return NextResponse.json(
            { error: contentResult2.error },
            { status: 400 }
          );
        }
        if (data.role !== "user" && data.role !== "ai") {
          return NextResponse.json(
            { error: "role must be 'user' or 'ai'" },
            { status: 400 }
          );
        }
        // Verify session ownership against authenticated user
        const ownerSession = await DatabaseService.getChatSessionById(
          data.sessionId
        );
        if (
          !ownerSession ||
          String(ownerSession.userId) !== String(authUserId)
        ) {
          return NextResponse.json(
            { error: "Unauthorized to add message to this session" },
            { status: 403 }
          );
        }
        const message = await DatabaseService.createChatMessage({
          content: contentResult2.value,
          role: data.role,
          sessionId: data.sessionId,
        });
        return NextResponse.json(message);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error("Error in chat POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const authUserId = auth.user.id;
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "updateSessionTopic":
        // Verify ownership before update
        const session = await DatabaseService.getChatSessionById(
          data.sessionId
        );
        if (!session) {
          return NextResponse.json(
            { error: "Chat session not found" },
            { status: 404 }
          );
        }
        if (String(session.userId) !== String(authUserId)) {
          return NextResponse.json(
            { error: "Unauthorized to update this session" },
            { status: 403 }
          );
        }
        const topicResult3 = validateAndSanitizeFreeText(data.topic, "topic", {
          required: true,
        });
        if (!topicResult3.ok) {
          return NextResponse.json(
            { error: topicResult3.error },
            { status: 400 }
          );
        }
        const updatedSession = await DatabaseService.updateChatSessionTopic(
          data.sessionId,
          topicResult3.value
        );
        return NextResponse.json(updatedSession);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error("Error in chat PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const authUserId = auth.user.id;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const userId = searchParams.get("userId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (String(userId) !== String(authUserId)) {
      return NextResponse.json(
        { error: "Forbidden: userId does not match authenticated user" },
        { status: 403 }
      );
    }

    // Verify the session belongs to the user before deleting
    const session = await DatabaseService.getChatSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    if (String(session.userId) !== String(authUserId)) {
      return NextResponse.json(
        { error: "Unauthorized to delete this session" },
        { status: 403 }
      );
    }

    await DatabaseService.deleteChatSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error("Error in chat DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

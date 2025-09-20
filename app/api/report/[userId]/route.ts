"use server";
import { type NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "../../../../utils/supabase/server";
import { DatabaseService } from "../../../../lib/services/database-service";
import { logger } from "../../../../lib/utils/logger";
import { ReportService } from "../../../../lib/services/report-service";

async function requireAuth() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return { ok: false as const, status: 401 };
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, status: 500 };
  }
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: auth.status }
      );

    const { userId } = await ctx.params;
    if (!userId)
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    if (String(userId) !== String(auth.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId)
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );

    const chatData = await DatabaseService.getCompleteChatSession(sessionId);
    if (!chatData)
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    if (String(chatData.session.userId) !== String(userId)) {
      return NextResponse.json(
        { error: "Unauthorized to access this session" },
        { status: 403 }
      );
    }

    const messages: Array<{ role: "user" | "assistant"; content: string }> = (
      chatData.messages || []
    ).map((m: any) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content:
        typeof m.content === "string" ? m.content : String(m.content ?? ""),
    }));

    logger.info("🧾 Generating report", {
      userId,
      sessionId,
      totalMessages: messages.length,
    });

    // Delegate to ReportService (handles Gemini/OpenAI fallback and placeholder)
    const report = await ReportService.generateReportFromMessages(messages);

    return NextResponse.json({ report });
  } catch (error) {
    logger.error("Error generating report", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

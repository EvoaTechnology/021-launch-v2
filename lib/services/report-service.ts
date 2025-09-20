import { getAvailableAPIKeys } from "../config/api-config";
import { generateReportWithChunkingGemini } from "../providers/gemini-provider";
import { generateReportWithChunking } from "../providers/openai-provider";
import { getReportInstructionAndTemplate } from "./report-template";
import { logger } from "../utils/logger";

export type BasicChatMessage = { role: "user" | "assistant"; content: string };

export class ReportService {
  static async generateReportFromMessages(
    messages: BasicChatMessage[]
  ): Promise<string> {
    const { instruction, template } = getReportInstructionAndTemplate();
    const baseInstruction = `${instruction}\n\nUse this template strictly:\n${template}`;

    const { gemini, openai } = getAvailableAPIKeys();

    let lastError: unknown = null;

    if (gemini) {
      try {
        const report = await generateReportWithChunkingGemini({
          apiKey: gemini,
          baseInstruction,
          fullMessages: messages,
          thresholdCount: 60,
          maxParts: 4,
        });
        console.log("report", report);
        if (report && report.trim().length > 0) return report;
      } catch (e) {
        lastError = e;
        logger.warn("[ReportService] Gemini failed", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    if (openai) {
      try {
        const report = await generateReportWithChunking({
          apiKey: openai,
          baseInstruction,
          fullMessages: messages,
          thresholdCount: 60,
          maxParts: 4,
          model: "gpt-4o-mini",
        });
        console.log("report", report);
        if (report && report.trim().length > 0) return report;
      } catch (e) {
        lastError = e;
        logger.warn("[ReportService] OpenAI failed", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    logger.error("[ReportService] All providers failed", {
      lastError:
        lastError instanceof Error ? lastError.message : String(lastError),
    });

    // structured placeholder
    const placeholder = template.replace(/><\/([A-Z_]+)>/g, ">TODO<</$1>");
    return placeholder;
  }
}

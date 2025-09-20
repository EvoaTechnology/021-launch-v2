import { ValidationReportData } from "../../components/ui/ValidationReport";

function extractTag(text: string, tag: string): string {
  const re = new RegExp(`<${tag}>[\s\S]*?<\/${tag}>`, "i");
  const m = text.match(re);
  if (!m) return "";
  return m[0]
    .replace(new RegExp(`^<${tag}>`, "i"), "")
    .replace(new RegExp(`<\/${tag}>$`, "i"), "")
    .trim();
}

export function parseTaggedReport(report: string): ValidationReportData {
  const title = extractTag(report, "TITLE");
  const summary = extractTag(report, "SUMMARY");
  const userIntent = extractTag(report, "USER_INTENT");
  const keyTopics = extractTag(report, "KEY_TOPICS");
  const painPoints = extractTag(report, "PAIN_POINTS");
  const suggestions = extractTag(report, "SUGGESTED_ACTIONS");
  const risks = extractTag(report, "RISKS");
  const nextSteps = extractTag(report, "NEXT_STEPS");

  // Best-effort mapping to ValidationReportData
  const competitors = [] as ValidationReportData["competitors"];
  const recommendations = suggestions
    ? suggestions
        .split(/\n|;|\u2022|\-/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const channels = keyTopics
    ? keyTopics
        .split(/\n|,|;|\u2022|\-/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const topRisks = risks
    ? risks
        .split(/\n|;|\u2022|\-/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const data: ValidationReportData = {
    ideaName: title || "Idea",
    subtitle: userIntent || summary || "",
    statusLabel: "Validated",
    score: 8.0,
    quickTake: summary || painPoints || "",
    problemMarketFit: painPoints || "",
    aiComment: summary || "",
    market: { tam: "-", sam: "-", som: "-", trend: null },
    competitors,
    solutionSummary: nextSteps || "",
    recommendations,
    risks: {
      topRisks,
      riskLevel: "Medium",
      riskLevelValue: 60,
    },
    goToMarket: {
      earlyStrategy: nextSteps || "",
      channels,
    },
    finalVerdict: 8.0,
  };

  return data;
}

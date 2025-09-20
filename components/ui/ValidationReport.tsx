import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface MarketMetrics {
  tam: string; // Total Addressable Market
  sam: string; // Serviceable Available Market
  som: string; // Serviceable Obtainable Market
  trend?: "up" | "down" | null;
}

export interface RiskItemDetail {
  risk: string;
  description: string;
}

export interface RiskAssessment {
  topRisks: Array<string | RiskItemDetail>;
  riskLevel: "Low" | "Medium" | "High";
  riskLevelValue: number; // 0-100 for progress bar
  mitigations?: Array<string | RiskItemDetail>;
}

export interface GoToMarket {
  earlyStrategy: string;
  channels: string[];
}

export interface ValidationReportData {
  ideaName: string;
  subtitle: string;
  statusLabel: string; // e.g., "Validated"
  score: number; // 0-10
  quickTake: string;
  problemMarketFit: string;
  aiComment: string;
  market: MarketMetrics;
  competitors: Competitor[];
  solutionSummary: string;
  recommendations: string[];
  risks: RiskAssessment;
  goToMarket: GoToMarket;
  finalVerdict: number; // 0-10
}

type Props = {
  data: ValidationReportData;
};

export function ValidationReport({ data }: Props) {
  const TrendIcon =
    data.market.trend === "up"
      ? TrendingUp
      : data.market.trend === "down"
      ? TrendingDown
      : null;

  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = document.createElement("style");
    printStyles.textContent = `
    @media print {
      /* Hide everything except the export container */
      body * { 
        visibility: hidden !important; 
      }
      
      #export-container, #export-container * { 
        visibility: visible !important; 
      }
      
      /* Position the container for printing */
      #export-container { 
        position: absolute !important; 
        left: 0 !important; 
        top: 0 !important; 
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 20px !important;
        background: white !important;
        color: black !important;
      }
      
      /* Ensure proper page breaks */
      .card {
        page-break-inside: avoid;
        margin-bottom: 20px;
      }
      
      /* Hide interactive elements in print */
      button, [onclick], .animate-spin, .cursor-pointer {
        display: none !important;
      }
      
      /* Ensure text is readable */
      * {
        color: black !important;
        background: white !important;
      }
      
      /* Remove shadows and complex backgrounds */
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
    }
  `;

    // Add styles to head
    document.head.appendChild(printStyles);

    // Trigger print
    window.print();

    // Clean up styles after printing
    setTimeout(() => {
      document.head.removeChild(printStyles);
    }, 1000);
  };

  const router = useRouter();

  return (
    <div
      id="export-container"
      className="w-full px-4 py-6 sm:py-8 flex  bg-[#01061C] dark:bg-[#01061C] justify-center">
      <div className="bg-[#081435] border border-[#1f2138] dark:border-[#2e3454] dark:bg-[#01061C] p-6 rounded-lg w-fit">
        {/* Top Bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">
            Startup Idea Validation Report
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#3d4770] text-[#10121c] hover:bg-[#1f2138] hover:text-white cursor-pointer gap-1"
              onClick={() => router.push("/chat")}>
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              className="gap-1 bg-[#1f2138] border border-[#3d4770] text-white hover:bg-[#2e3454] hover:text-white cursor-pointer"
              onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-6xl space-y-6">
          {/* Executive Summary */}
          <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
            <CardHeader className="pb-3">
              <p className="text-base font-semibold text-pink-400">
                Executive Summary
              </p>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl text-white">
                    {data.ideaName}
                  </CardTitle>
                  <p className="mt-1 text-base text-[#b1b7d1]">
                    {data.subtitle}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 self-start sm:self-auto">
                  <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {data.statusLabel}
                  </Badge>
                  <div className="flex items-center justify-center rounded-xl bg-[#2e3454] px-3 py-1 border border-[#3d4770]">
                    <div className="text-lg font-bold text-white">
                      {data.score.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg bg-[#2e3454]/20 p-4 text-sm text-white border border-[#3d4770]/50 backdrop-blur-sm shadow-inner shadow-black/10">
                <span className="mr-2 font-semibold text-lg text-yellow-300">
                  <span className="text-red-400 font-sans">
                    6<span className="font-mono">I</span> AIx
                  </span>{" "}
                  Quick Take
                </span>
                <div className="mt-2 text-[#d8dbe8]">{data.quickTake}</div>
              </div>
            </CardContent>
          </Card>

          {/* Two-column grid: Problem/AI Comment */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  Problem & Market Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#d8dbe8] text-sm leading-relaxed">
                  {data.problemMarketFit}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  AI Comment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#d8dbe8] text-sm leading-relaxed">
                  {data.aiComment}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Market Analysis + Solution Evaluation */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Market Metrics - Larger and more prominent */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-[#2e3454]/20 border border-[#3d4770]/50 backdrop-blur-sm shadow-inner shadow-black/10">
                    <div className="text-xs text-[#8a93ba] mb-1">TAM</div>
                    <div className="text-2xl font-bold text-white">
                      {data.market.tam}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#2e3454]/20 border border-[#3d4770]/50 backdrop-blur-sm shadow-inner shadow-black/10">
                    <div className="text-xs text-[#8a93ba] mb-1">SAM</div>
                    <div className="text-2xl font-bold text-white">
                      {data.market.sam}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#2e3454]/20 border border-[#3d4770]/50 backdrop-blur-sm shadow-inner shadow-black/10">
                    <div className="text-xs text-[#8a93ba] mb-1">SOM</div>
                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                      {data.market.som}
                      {TrendIcon ? (
                        <TrendIcon className="h-5 w-5 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Competitor Analysis */}
                <div>
                  <div className="mb-3 text-lg font-medium text-pink-300">
                    Competitor <span className="text-pink-200">Snapshot</span>
                  </div>
                  <div className="space-y-3">
                    {data.competitors.map((c) => (
                      <div
                        key={c.name}
                        className="grid grid-cols-3 items-center gap-4 rounded-lg border border-[#3d4770]/50 p-4 bg-[#2e3454]/20 backdrop-blur-sm shadow-inner shadow-black/10">
                        <div className="font-semibold text-white text-sm">
                          {c.name}
                        </div>
                        <div className="text-emerald-400 text-sm">
                          <span className="text-emerald-300 font-medium">
                            Strength:
                          </span>{" "}
                          {c.strength}
                        </div>
                        <div className="text-rose-400 text-sm">
                          <span className="text-rose-300 font-medium">
                            Weakness:
                          </span>{" "}
                          {c.weakness}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  Solution Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 text-lg font-medium text-pink-300">
                    Proposed Solution Summary
                  </div>
                  <p className="text-sm text-[#d8dbe8] leading-relaxed">
                    {data.solutionSummary}
                  </p>
                </div>
                <div>
                  <div className="mb-1 text-xl font-medium text-pink-300">
                    AI Recommendations
                  </div>
                  <ul className="list-decimal space-y-1 pl-5 text-sm text-[#d8dbe8]">
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment + GTM */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  Risk Assessment
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Top Risks & Mitigations side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Risks */}
                  <div>
                    <div className="mb-2 text-lg font-medium text-pink-300">
                      Top Risks
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-[#d8dbe8]">
                      {data.risks.topRisks.map((risk, idx) => (
                        <li key={idx}>
                          {typeof risk === "string"
                            ? risk
                            : `${risk.risk}: ${risk.description}`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Mitigations */}
                  {data.risks.mitigations &&
                    data.risks.mitigations.length > 0 && (
                      <div>
                        <div className="mb-2 text-lg font-medium text-pink-300">
                          Risk Mitigations
                        </div>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-[#d8dbe8]">
                          {data.risks.mitigations.map((mitigation, idx) => (
                            <li key={idx}>
                              {typeof mitigation === "string"
                                ? mitigation
                                : `${mitigation.risk}: ${mitigation.description}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Risk Level */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-pink-300 text-lg">Risk Level</span>
                    <Badge variant="secondary" className="capitalize">
                      <div className="px-2 py-0.5 text-xs font-semibold text-pink-600 bg-pink-100 rounded">
                        {data.risks.riskLevel}
                      </div>
                    </Badge>
                  </div>

                  {/* Custom Pink Risk Bar */}
                  <div className="relative mt-3 h-4 w-full rounded-md bg-[#2e3454] overflow-hidden border border-[#3d4770]">
                    <div
                      className="absolute top-0 left-0 h-full bg-pink-500"
                      style={{ width: `${data.risks.riskLevelValue}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#10121c]/20 border-[#2e3454]/50 backdrop-blur-md shadow-lg shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-pink-400">
                  Go-to-Market Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 text-lg font-medium text-pink-300">
                    Early Entry Strategy
                  </div>
                  <p className="text-sm text-[#d8dbe8]">
                    {data.goToMarket.earlyStrategy}
                  </p>
                </div>
                <div>
                  <div className="mb-1 text-lg font-medium text-pink-300">
                    Potential Acquisition Channels
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.goToMarket.channels.map((ch) => (
                      <Badge
                        key={ch}
                        variant="secondary"
                        className="text-sm text-white bg-[#2e3454] border border-[#3d4770]">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#3d4770]/50 p-3 bg-[#2e3454]/20 backdrop-blur-sm shadow-inner shadow-black/10">
                  <div>
                    <div className="text-lg uppercase text-white">
                      AI&apos;s Final Verdict
                    </div>
                    <div className="text-sm text-[#b1b7d1]">
                      Overall Validation Score
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#2e3454] px-3 py-1.5 text-white border border-[#3d4770]">
                    <div className="text-lg font-bold">
                      {data.finalVerdict.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidationReport;

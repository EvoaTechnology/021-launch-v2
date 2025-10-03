"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ValidationReport,
  ValidationReportData,
} from "../../components/ui/ValidationReport";
import { parseTaggedReport } from "../../lib/services/report-parser";

function ReportPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("sessionId");
  const userId = params.get("userId");
  const [data, setData] = useState<ValidationReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => !!sessionId && !!userId, [sessionId, userId]);

  useEffect(() => {
    if (!canFetch) return;
    const controller = new AbortController();
    let cancelled = false;

    const run = async (attempt = 1) => {
      try {
        const resp = await fetch(
          `/api/report/${userId}?sessionId=${encodeURIComponent(sessionId!)}`,
          { signal: controller.signal }
        );
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || "Failed to fetch report");
        if (cancelled) return;
        const parsed = parseTaggedReport(String(json.report || ""));
        setData(parsed);
      } catch (e: unknown) {
        if (cancelled) return;
        const isAbort = e instanceof DOMException && e.name === "AbortError";
        if (isAbort) return; // ignore aborts
        // retry once on transient errors
        if (attempt === 1) {
          setTimeout(() => run(2), 400);
          return;
        }
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
      }
    };

    run(1);
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [canFetch, sessionId, userId]);

  if (!canFetch) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Missing user or session. Go back to chat.
        <button className="ml-3 underline" onClick={() => router.push("/chat")}>
          Chat
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-white">
        <div className="mb-2">Error: {error}</div>
        <button className="underline" onClick={() => router.push("/chat")}>
          Back to chat
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Generating your report...
      </div>
    );
  }

  return <ValidationReport data={data} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <ReportPageInner />
    </Suspense>
  );
}

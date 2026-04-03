"use client";

import { useCallback, useState } from "react";
import type { AiSummaryPayload } from "@/lib/np-assessment/scoring";

type AiSummaryResponse = {
  strongestCategories: string;
  needsAttention: string;
  essentialFirst: string;
};

export function NpAssessmentAiPanel({ payload }: { payload: AiSummaryPayload }) {
  const [data, setData] = useState<AiSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/np-assessment/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ payload }),
      });
      const j = (await r.json()) as AiSummaryResponse & { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setData({
        strongestCategories: j.strongestCategories,
        needsAttention: j.needsAttention,
        essentialFirst: j.essentialFirst,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate summary");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-stone-900">AI executive summary</h3>
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-800 ring-1 ring-stone-200/80 hover:bg-stone-200/80 disabled:opacity-50"
        >
          {loading ? "Generating…" : data ? "Regenerate" : "Generate"}
        </button>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Generated from your scores only — not legal advice. Requires <code className="rounded bg-stone-100 px-1">OPENAI_API_KEY</code>{" "}
        on the server.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Strongest areas</h4>
            <p className="mt-1.5">{data.strongestCategories}</p>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Needs attention</h4>
            <p className="mt-1.5">{data.needsAttention}</p>
          </section>
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Essential items first</h4>
            <p className="mt-1.5">{data.essentialFirst}</p>
          </section>
        </div>
      ) : !loading && !error ? (
        <p className="mt-4 text-sm text-stone-500">Click Generate for a short narrative of strengths, gaps, and Essential priorities.</p>
      ) : null}
    </div>
  );
}

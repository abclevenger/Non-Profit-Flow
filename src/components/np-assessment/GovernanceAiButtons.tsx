"use client";

import { useCallback, useState } from "react";
import type { StandardsPillarId } from "@/lib/np-assessment/standards-framework";

type Mode = "explain" | "next" | "policy_draft";

export function GovernanceAiButtons({
  pillarId,
  pillarLabel,
  pillarSummary,
  organizationName,
  missionSnippet,
  questionText,
  indicatorCode,
  responseLabel,
  ratingLabel,
  disabled,
}: {
  pillarId: StandardsPillarId;
  pillarLabel: string;
  pillarSummary: string;
  organizationName?: string;
  missionSnippet?: string;
  questionText?: string;
  indicatorCode?: string;
  responseLabel?: string;
  ratingLabel?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (mode: Mode) => {
      setLoading(mode);
      setError(null);
      try {
        const r = await fetch("/api/np-assessment/governance-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            mode,
            pillarLabel,
            pillarSummary,
            organizationName,
            missionSnippet,
            questionText,
            indicatorCode,
            responseLabel,
            ratingLabel,
          }),
        });
        const j = (await r.json()) as { text?: string; error?: string };
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        setText(j.text ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Request failed");
        setText(null);
      } finally {
        setLoading(null);
      }
    },
    [
      indicatorCode,
      missionSnippet,
      organizationName,
      pillarLabel,
      pillarSummary,
      questionText,
      ratingLabel,
      responseLabel,
    ],
  );

  const btn =
    "rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50";

  return (
    <div className="space-y-2" data-pillar-ai={pillarId}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">AI governance assistant</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={disabled || loading !== null} onClick={() => void run("explain")}>
          {loading === "explain" ? "…" : "Explain this issue"}
        </button>
        <button type="button" className={btn} disabled={disabled || loading !== null} onClick={() => void run("next")}>
          {loading === "next" ? "…" : "What should we do next?"}
        </button>
        <button
          type="button"
          className={btn}
          disabled={disabled || loading !== null}
          onClick={() => void run("policy_draft")}
        >
          {loading === "policy_draft" ? "…" : "Generate policy draft"}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {text ? (
        <div className="rounded-lg border border-stone-200/90 bg-stone-50/80 p-3 text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
          {text}
        </div>
      ) : null}
    </div>
  );
}

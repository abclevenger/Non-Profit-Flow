"use client";

import Link from "next/link";
import type { GovernanceInsight } from "@/lib/insights/types";

const tone: Record<GovernanceInsight["severity"], string> = {
  risk: "border-rose-200/90 bg-rose-50/80 text-rose-950",
  attention: "border-amber-200/90 bg-amber-50/80 text-amber-950",
  info: "border-sky-200/80 bg-sky-50/70 text-sky-950",
};

export type InsightStripProps = {
  insights: GovernanceInsight[];
  title?: string;
  description?: string;
  maxVisible?: number;
  /** Return false to show a note instead of navigating (e.g. guest role vs /voting). */
  followInsightHref?: (href: string) => boolean;
};

export function InsightStrip({
  insights,
  title = "Insights for your board",
  description = "Planning prompts from this demo profile — not legal advice.",
  maxVisible = 5,
  followInsightHref = () => true,
}: InsightStripProps) {
  const shown = insights.slice(0, maxVisible);

  if (shown.length === 0) {
    return (
      <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
        <h2 className="font-serif text-lg font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">No proactive prompts right now — your sample profile looks calm.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      {title ? <h2 className="font-serif text-lg font-semibold text-stone-900">{title}</h2> : null}
      {description ? <p className={`text-sm text-stone-600 ${title ? "mt-1" : ""}`}>{description}</p> : null}
      <ul className={`space-y-3 ${title || description ? "mt-4" : ""}`}>
        {shown.map((i) => (
          <li
            key={i.id}
            className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${tone[i.severity]}`}
          >
            <p className="font-semibold">{i.title}</p>
            <p className="mt-1 leading-relaxed opacity-95">{i.detail}</p>
            {followInsightHref(i.href) ? (
              <Link
                href={i.href}
                className="mt-2 inline-block text-xs font-bold uppercase tracking-wide underline-offset-4 hover:underline"
              >
                Open related area
              </Link>
            ) : (
              <p className="mt-2 text-xs font-medium opacity-90">
                Related app area is limited for your current role — ask an administrator if you need access.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { ReactNode } from "react";
import type { RiskItem } from "@/lib/mock-data/types";
import { StatusPill } from "./StatusPill";

export type RiskCardProps = RiskItem & {
  gcReviewFooter?: ReactNode;
};

export function RiskCard({ category, status, summary, owner, watchlist, trend, gcReviewFooter }: RiskCardProps) {
  return (
    <article className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-stone-900">{category}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {watchlist ? <StatusPill label="Watchlist" tone="attention" /> : null}
          <StatusPill label={status} riskLevel={status} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{summary}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
        {owner ? <span>Owner: {owner}</span> : null}
        {trend ? (
          <span className="rounded-md bg-stone-50 px-2 py-0.5 ring-1 ring-stone-200/80">
            Trend: {trend}
          </span>
        ) : null}
      </div>
      {gcReviewFooter ? <div className="mt-4 border-t border-stone-200/80 pt-4">{gcReviewFooter}</div> : null}
    </article>
  );
}
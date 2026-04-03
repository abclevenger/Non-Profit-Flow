"use client";

import type { QuickStatModel } from "@/lib/overview/overviewFocusModel";

export function QuickStatsRow({ stats }: { stats: QuickStatModel[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-stone-200/80 bg-white px-6 py-6 text-center shadow-sm ring-1 ring-stone-100/70"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{s.label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-stone-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

"use client";

import type { GcStatusKey } from "@/lib/gc-review/constants";
import { GC_STATUS_LABEL } from "@/lib/gc-review/constants";

const shell: Record<GcStatusKey, string> = {
  PENDING: "bg-violet-50 text-violet-950 ring-violet-200/90",
  UNDER_REVIEW: "bg-sky-50 text-sky-950 ring-sky-200/90",
  COMPLETE: "bg-emerald-50 text-emerald-950 ring-emerald-200/90",
  ESCALATED: "bg-rose-50 text-rose-950 ring-rose-200/90",
  NEEDS_INFO: "bg-amber-50 text-amber-950 ring-amber-200/90",
};

export function GcReviewStatusPill({ statusKey }: { statusKey: GcStatusKey }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${shell[statusKey]}`}
      title={GC_STATUS_LABEL[statusKey]}
    >
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" aria-hidden />
      {GC_STATUS_LABEL[statusKey]}
    </span>
  );
}

"use client";

import type { ExpertStatusKey } from "@/lib/expert-review/constants";
import { EXPERT_STATUS_LABEL } from "@/lib/expert-review/constants";

const shell: Record<ExpertStatusKey, string> = {
  SUBMITTED: "bg-stone-100 text-stone-900 ring-stone-200/90",
  ROUTED: "bg-sky-50 text-sky-950 ring-sky-200/80",
  EMAIL_SENT: "bg-emerald-50 text-emerald-950 ring-emerald-200/80",
  IN_PROGRESS: "bg-violet-50 text-violet-950 ring-violet-200/80",
  COMPLETED: "bg-stone-50 text-stone-700 ring-stone-200/70",
  NEEDS_MORE_INFO: "bg-amber-50 text-amber-950 ring-amber-200/80",
  FAILED_DELIVERY: "bg-rose-50 text-rose-950 ring-rose-200/80",
};

export function ExpertReviewStatusPill({
  statusKey,
  categoryLabel,
}: {
  statusKey: ExpertStatusKey;
  categoryLabel?: string;
}) {
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${shell[statusKey]}`}
    >
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden />
      {EXPERT_STATUS_LABEL[statusKey]}
      {categoryLabel ? <span className="font-semibold normal-case text-stone-600">· {categoryLabel}</span> : null}
    </span>
  );
}

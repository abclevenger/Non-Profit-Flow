"use client";

import type { TrainingModuleCompletionStatus } from "@/lib/mock-data/types";

const styles: Record<TrainingModuleCompletionStatus, string> = {
  "Not Started": "bg-stone-100 text-stone-600 ring-stone-200/80",
  "In Progress": "bg-sky-50 text-sky-900 ring-sky-200/80",
  Complete: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
};

export function CompletionStatusPill({ status }: { status: TrainingModuleCompletionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}

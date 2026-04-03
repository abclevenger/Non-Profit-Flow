import type { MinutesRecordStatus } from "@/lib/mock-data/types";

const styles: Record<MinutesRecordStatus, string> = {
  Draft: "bg-amber-50 text-amber-950 ring-amber-200/80",
  "In Review": "bg-violet-50 text-violet-950 ring-violet-200/80",
  Approved: "bg-emerald-50 text-emerald-950 ring-emerald-200/80",
  Published: "bg-teal-50 text-teal-950 ring-teal-200/80",
};

export function MinutesStatusPill({ status }: { status: MinutesRecordStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}

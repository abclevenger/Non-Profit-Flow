import type { BoardVoteStatus } from "@/lib/mock-data/types";

const styles: Record<BoardVoteStatus, string> = {
  Draft: "bg-stone-100 text-stone-800 ring-stone-200/90",
  Scheduled: "bg-sky-50 text-sky-950 ring-sky-200/80",
  "Open for Vote": "bg-emerald-50 text-emerald-950 ring-emerald-200/80",
  Closed: "bg-violet-50 text-violet-950 ring-violet-200/80",
  Finalized: "bg-stone-200/80 text-stone-900 ring-stone-300/80",
  Tabled: "bg-amber-50 text-amber-950 ring-amber-200/80",
  "Needs Follow-Up": "bg-orange-50 text-orange-950 ring-orange-200/80",
};

export function VoteStatusPill({ status }: { status: BoardVoteStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}
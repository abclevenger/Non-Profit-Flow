import type { BoardVoteItem } from "@/lib/mock-data/types";

export function VoteTimelineCard({ vote }: { vote: BoardVoteItem }) {
  const rows = [
    { label: "Created", value: vote.createdAt },
    { label: "Voting opens", value: vote.opensAt },
    { label: "Voting closes", value: vote.closesAt },
    { label: "Decision deadline", value: vote.decisionDate },
    ...(vote.meetingDate ? [{ label: "Meeting", value: vote.meetingDate }] as const : []),
    ...(vote.finalizedAt ? [{ label: "Finalized", value: vote.finalizedAt }] as const : []),
  ];

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/60 p-4 shadow-sm ring-1 ring-white/40 backdrop-blur-md">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Timeline</h4>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col gap-0.5 border-b border-stone-100 pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="text-xs font-medium text-stone-500">{r.label}</span>
            <span className="text-sm font-medium text-stone-900 sm:text-right">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
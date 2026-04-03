import type { VotingSummaryStats } from "@/lib/voting/voteHelpers";

export function VotingSummaryCards({ stats }: { stats: VotingSummaryStats }) {
  const cards = [
    { label: "Upcoming votes", value: stats.upcoming, hint: "Draft & scheduled" },
    { label: "Open for vote", value: stats.open, hint: "Active voting window" },
    { label: "Decisions due soon", value: stats.dueSoon, hint: "Watch timing" },
    { label: "Needs follow-up", value: stats.followUp, hint: "Coordinator attention" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-stone-200/70 bg-white/50 p-5 shadow-sm ring-1 ring-white/40 backdrop-blur-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{c.label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">{c.value}</p>
          <p className="mt-1 text-xs text-stone-500">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}
import type { MinutesSummaryStats } from "@/lib/minutes/minutesHelpers";

export function MinutesSummaryCards({ stats }: { stats: MinutesSummaryStats }) {
  const cards = [
    { label: "Draft minutes", value: stats.draft, hint: "Being compiled" },
    { label: "In review", value: stats.inReview, hint: "Internal review" },
    { label: "Approved records", value: stats.approved, hint: "Approved or published" },
    { label: "Meetings w/ open follow-up", value: stats.meetingsWithOpenFollowUp, hint: "Needs tracking" },
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

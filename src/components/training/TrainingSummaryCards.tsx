import type { TrainingSummaryStats } from "@/lib/training/trainingHelpers";

export function TrainingSummaryCards({ stats }: { stats: TrainingSummaryStats }) {
  const cards = [
    { label: "Orientation completion", value: `${stats.orientationPercent}%`, hint: "Demo aggregate progress" },
    { label: "Required topics", value: String(stats.requiredTopics), hint: "Core modules" },
    { label: "Recommended resources", value: String(stats.recommendedResources), hint: "Coordinator highlights" },
    { label: "Documents reviewed", value: `${stats.documentsReviewed}/${stats.documentsTotal}`, hint: "Key readings" },
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

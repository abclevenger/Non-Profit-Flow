import type { MinutesDecisionItem } from "@/lib/mock-data/types";

export function DecisionSummaryList({ decisions }: { decisions: MinutesDecisionItem[] }) {
  if (!decisions.length) {
    return <p className="text-sm text-stone-500">No formal decisions recorded yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {decisions.map((d) => (
        <li key={d.id} className="rounded-xl border border-stone-200/70 bg-white/50 p-4 ring-1 ring-stone-100/80">
          <p className="font-medium text-stone-900">{d.title}</p>
          <p className="mt-1 text-sm text-stone-600">{d.summary}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Outcome: {d.outcome}</p>
        </li>
      ))}
    </ul>
  );
}

import type { BoardTrainingBundle } from "@/lib/mock-data/types";

export function GovernanceBasicsCard({ points }: { points: BoardTrainingBundle["governanceBasics"] }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Governance basics</h3>
      <p className="mt-1 text-sm text-stone-600">Plain-language guardrails for how the board works with leadership.</p>
      <ul className="mt-5 space-y-4">
        {points.map((p) => (
          <li key={p.id} className="rounded-xl bg-white/50 p-4 ring-1 ring-stone-200/60">
            <p className="text-sm font-semibold text-stone-900">{p.heading}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

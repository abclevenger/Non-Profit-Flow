import type { BoardTrainingBundle, TrainingResource } from "@/lib/mock-data/types";

const typeLabel: Record<TrainingResource["type"], string> = {
  handbook: "Handbook",
  bylaws: "Bylaws",
  policy: "Policy",
  plan: "Plan",
  packet: "Packet",
  orientation: "Orientation",
  other: "Other",
};

export function ResourceListCard({ resources }: { resources: BoardTrainingBundle["resources"] }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Important documents</h3>
      <p className="mt-1 text-sm text-stone-600">Central list for onboarding — link out to your portal or drive in production.</p>
      <ul className="mt-5 divide-y divide-stone-200/70">
        {resources.map((r) => (
          <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{typeLabel[r.type]}</p>
              <p className="mt-1 font-medium text-stone-900">{r.title}</p>
              <p className="mt-1 text-sm text-stone-600">{r.description}</p>
            </div>
            <div className="shrink-0 text-right text-xs text-stone-500">
              {r.recommended ? (
                <span className="mb-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-900 ring-1 ring-amber-200/80">
                  Recommended
                </span>
              ) : null}
              <p className="mt-1">Updated {r.lastUpdated}</p>
              {r.href ? (
                <a href={r.href} className="mt-2 inline-block font-semibold text-stone-800 underline-offset-4 hover:underline">
                  Open
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { BoardTrainingBundle } from "@/lib/mock-data/types";

export function OrientationTimelineCard({ steps }: { steps: BoardTrainingBundle["orientationTimeline"] }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Suggested first weeks</h3>
      <p className="mt-1 text-sm text-stone-600">A gentle sequence — adjust dates with your coordinator.</p>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={s.id} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900/90 text-sm font-semibold text-white">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{s.weekLabel}</p>
              <p className="mt-0.5 font-medium text-stone-900">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

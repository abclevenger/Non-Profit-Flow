"use client";

export function BoardReadinessBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const tone =
    clamped >= 75 ? "bg-emerald-600" : clamped >= 55 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100/80">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Board readiness</p>
          <p className="mt-1 font-serif text-3xl font-semibold tabular-nums text-stone-900">{clamped}%</p>
        </div>
        <p className="max-w-xs text-right text-xs text-stone-500">
          Demo blend of training, open decisions, actions, and risk flags — not a formal score.
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200/90">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

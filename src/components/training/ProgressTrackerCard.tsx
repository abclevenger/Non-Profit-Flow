import type { BoardTrainingBundle } from "@/lib/mock-data/types";

export function ProgressTrackerCard({ bundle }: { bundle: BoardTrainingBundle }) {
  const { progress, modules } = bundle;
  const complete = modules.filter((m) => m.status === "Complete").length;
  const remaining = modules.length - complete;
  const barWidth = `${progress.percentComplete}%`;
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Progress</h3>
      <p className="mt-1 text-sm text-stone-600">A simple snapshot for coordinators and new members (demo data).</p>
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-semibold text-stone-900">{progress.percentComplete}%</span>
          <span className="text-sm text-stone-500">Last viewed {progress.lastViewedDate}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200/80">
          <div className="h-full rounded-full bg-stone-800/90 transition-[width]" style={{ width: barWidth }} />
        </div>
      </div>
      <dl className="mt-6 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
        <div className="rounded-xl bg-white/50 p-3 ring-1 ring-stone-200/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Completed modules</dt>
          <dd className="mt-1 text-lg font-semibold text-stone-900">{complete}</dd>
        </div>
        <div className="rounded-xl bg-white/50 p-3 ring-1 ring-stone-200/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Remaining</dt>
          <dd className="mt-1 text-lg font-semibold text-stone-900">{remaining}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-stone-500">
        Future: per-user rows, acknowledgements, and reminders — replace progress from your API.
      </p>
    </div>
  );
}

import type { StrategicPriority } from "@/lib/mock-data/types";
import { StatusPill } from "./StatusPill";

export type ProgressCardProps = StrategicPriority & { showAlignment?: boolean };

export function ProgressCard({
  title,
  progress,
  owner,
  status,
  nextMilestone,
  description,
  summary,
  alignmentNote,
  showAlignment,
}: ProgressCardProps) {
  const body = description || summary || "";
  return (
    <article className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-medium text-stone-900">{title}</h3>
        <StatusPill label={status} strategicStatus={status} />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Progress</span>
          <span className="font-medium text-stone-700">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: "var(--demo-accent, #6b5344)",
            }}
          />
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm text-stone-600">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-stone-700">Owner</dt>
          <dd>{owner}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-stone-700">Next milestone</dt>
          <dd>{nextMilestone}</dd>
        </div>
      </dl>
      {body ? <p className="mt-3 text-sm leading-relaxed text-stone-600">{body}</p> : null}
      {showAlignment && alignmentNote ? (
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200/80">
          <span className="font-medium text-stone-800">Alignment note. </span>
          {alignmentNote}
        </p>
      ) : null}
    </article>
  );
}
import type { TrainingModuleItem } from "@/lib/mock-data/types";
import { CompletionStatusPill } from "./CompletionStatusPill";

export function TrainingModuleCard({ module: m }: { module: TrainingModuleItem }) {
  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{m.category}</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">{m.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{m.summary}</p>
        </div>
        <CompletionStatusPill status={m.status} />
      </div>
      {m.content.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-stone-600">
          {m.content.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-600">
        <span className="rounded-full bg-stone-100/90 px-2 py-0.5 font-medium text-stone-700 ring-1 ring-stone-200/70">
          {m.required ? "Required" : "Optional"}
        </span>
        <span className="rounded-full bg-white/80 px-2 py-0.5 ring-1 ring-stone-200/70">{m.estimatedTime}</span>
      </div>
    </article>
  );
}

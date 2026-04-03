import type { WorkflowAgendaItem } from "@/lib/mock-data/types";

export function WorkflowAgendaList({ items }: { items: WorkflowAgendaItem[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.id}
          className="flex gap-3 rounded-xl border border-stone-200/70 bg-white/50 px-4 py-3 ring-1 ring-stone-100/80"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200/80 text-xs font-bold text-stone-700">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-stone-900">{item.title}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.informational ? (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Informational</span>
              ) : (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-rose-900 ring-1 ring-rose-200/80">
                  Decision required
                </span>
              )}
              {item.linkedVoteId ? (
                <span className="text-xs text-stone-500">Vote: {item.linkedVoteId}</span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}


import type { MinutesFollowUpAction } from "@/lib/mock-data/types";

export function FollowUpActionsList({ actions }: { actions: MinutesFollowUpAction[] }) {
  if (!actions.length) {
    return <p className="text-sm text-stone-500">No follow-up items listed.</p>;
  }
  return (
    <ul className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/70 bg-white/50 ring-1 ring-stone-100/80">
      {actions.map((a) => (
        <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium text-stone-900">{a.task}</p>
            <p className="mt-1 text-sm text-stone-600">{a.owner}</p>
          </div>
          <div className="shrink-0 text-right text-xs">
            <p className="font-semibold text-stone-700">{a.status}</p>
            <p className="mt-0.5 text-stone-500">Due {a.dueDate}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

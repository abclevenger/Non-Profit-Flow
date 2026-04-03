import type { ExecutiveUpdate } from "@/lib/mock-data/types";

export type ExecutiveUpdateCardProps = { update: ExecutiveUpdate };

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm text-stone-700">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExecutiveUpdateCard({ update }: ExecutiveUpdateCardProps) {
  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Executive director update</h3>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <ListBlock title="Wins" items={update.wins} />
        <ListBlock title="Blockers" items={update.blockers} />
        <ListBlock title="Notes for the board" items={update.boardNotes} />
        <ListBlock title="Changes since last meeting" items={update.changesSinceLastMeeting} />
      </div>
      {update.priorityIssues?.length ? (
        <div className="mt-6 border-t border-stone-200/80 pt-5">
          <ListBlock title="Priority issues" items={update.priorityIssues} />
        </div>
      ) : null}
    </div>
  );
}
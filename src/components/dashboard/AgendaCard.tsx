import type { BoardAgenda } from "@/lib/mock-data/types";

function itemsByKind(agenda: BoardAgenda, kind: BoardAgenda["items"][number]["kind"]) {
  return agenda.items.filter((i) => i.kind === kind).map((i) => i.title);
}

export type AgendaCardProps = { agenda: BoardAgenda };

export function AgendaCard({ agenda }: AgendaCardProps) {
  const decisions = itemsByKind(agenda, "decision");
  const discussion = itemsByKind(agenda, "discussion");
  const approvals = itemsByKind(agenda, "approval");
  const general = itemsByKind(agenda, "general");

  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Next board meeting
      </p>
      <p className="mt-1 font-serif text-lg font-semibold text-stone-900">{agenda.nextMeetingDate}</p>
      {agenda.meetingLabel ? (
        <p className="mt-1 text-sm text-stone-600">{agenda.meetingLabel}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Agenda items</h4>
          <ul className="mt-2 space-y-2 text-sm text-stone-700">
            {agenda.items.map((item) => (
              <li
                key={item.title}
                className="rounded-lg bg-stone-50/80 px-3 py-2 ring-1 ring-stone-200/60"
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <AgendaColumn title="Decisions needed" lines={decisions} />
          <AgendaColumn title="Discussion items" lines={discussion} />
          <AgendaColumn title="Approvals needed" lines={approvals} />
        </div>
        {general.length ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Other items
            </h4>
            <ul className="mt-2 list-inside list-disc text-sm text-stone-700">
              {general.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AgendaColumn({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h4>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">None listed</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
          {lines.map((line) => (
            <li key={line} className="leading-snug">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
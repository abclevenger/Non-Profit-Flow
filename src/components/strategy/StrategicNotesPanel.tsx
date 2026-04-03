import type { StrategicPriority } from "@/lib/mock-data/types";

export type StrategicNotesPanelProps = {
  priorities: StrategicPriority[];
};

export function StrategicNotesPanel({ priorities }: StrategicNotesPanelProps) {
  const rows = priorities.filter((p) => p.notes?.trim());

  if (rows.length === 0) return null;

  return (
    <section className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-stone-900">Updates from leadership</h2>
      <p className="mt-1 text-sm text-stone-600">Short notes tied to each strategic priority.</p>
      <ul className="mt-4 space-y-4">
        {rows.map((p) => (
          <li key={p.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-stone-900">{p.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{p.notes}</p>
            <p className="mt-1 text-xs text-stone-500">Last updated {p.lastUpdated}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
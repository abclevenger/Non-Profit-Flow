import type { MeetingMinutesRecord } from "@/lib/mock-data/types";
import { MeetingMinutesCard } from "./MeetingMinutesCard";

export function MinutesList({
  title,
  description,
  records,
  selectedId,
  onSelect,
}: {
  title: string;
  description?: string;
  records: MeetingMinutesRecord[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (!records.length) {
    return (
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
        {description ? <p className="text-sm text-stone-600">{description}</p> : null}
        <p className="text-sm text-stone-500">No records in this group.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {records.map((r) => (
          <MeetingMinutesCard
            key={r.id}
            record={r}
            selected={selectedId === r.id}
            onSelect={onSelect ? () => onSelect(r.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

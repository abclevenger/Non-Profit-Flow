import type { BoardMeetingType } from "@/lib/mock-data/types";

export function MeetingTypeLabel({ type }: { type: BoardMeetingType }) {
  return (
    <span className="rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-stone-700 ring-1 ring-stone-200/80">
      {type}
    </span>
  );
}

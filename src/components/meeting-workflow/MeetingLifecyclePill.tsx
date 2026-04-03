import type { BoardMeetingStatus } from "@/lib/mock-data/types";

const styles: Record<BoardMeetingStatus, string> = {
  Scheduled: "bg-sky-50 text-sky-950 ring-sky-200/80",
  "In Progress": "bg-amber-50 text-amber-950 ring-amber-200/80",
  Completed: "bg-stone-100 text-stone-700 ring-stone-200/80",
};

export function MeetingLifecyclePill({ status }: { status: BoardMeetingStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}

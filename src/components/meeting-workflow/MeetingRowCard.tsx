import Link from "next/link";
import type { BoardMeeting } from "@/lib/mock-data/types";
import { daysUntilMeeting } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { MeetingLifecyclePill } from "./MeetingLifecyclePill";
import { MeetingPublicBadge } from "./MeetingPublicBadge";
import { MeetingTypeLabel } from "./MeetingTypeLabel";

export function MeetingRowCard({ meeting }: { meeting: BoardMeeting }) {
  const days = daysUntilMeeting(meeting.dateKey);
  const soon = meeting.status === "Scheduled" && days >= 0 && days <= 7;
  const done = meeting.status === "Completed";
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="block rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">{meeting.meetingDate}</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">{meeting.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <MeetingTypeLabel type={meeting.meetingType} />
            <MeetingLifecyclePill status={meeting.status} />
            <MeetingPublicBadge publicVisible={meeting.publicVisible} />
          </div>
        </div>
        {soon ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80">
            Soon
          </span>
        ) : done ? (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200/80">
            Completed
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-stone-600">
        {meeting.agendaItems.length} agenda item{meeting.agendaItems.length === 1 ? "" : "s"} · {meeting.voteItems.length}{" "}
        linked vote{meeting.voteItems.length === 1 ? "" : "s"}
      </p>
    </Link>
  );
}

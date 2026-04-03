"use client";

import type { MeetingMinutesRecord } from "@/lib/mock-data/types";
import { MinutesPublicVisibilityTag } from "./MinutesPublicVisibilityTag";
import { MinutesStatusPill } from "./MinutesStatusPill";

export function MeetingMinutesCard({
  record,
  onSelect,
  selected,
}: {
  record: MeetingMinutesRecord;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const decisions = record.decisionsMade.length;
  const followUps = record.followUpActions.filter((a) => {
    const s = a.status.toLowerCase();
    return s === "open" || s === "in progress" || s === "not started";
  }).length;

  const inner = (
    <article
      className={`rounded-2xl border border-stone-200/80 bg-white/60 p-5 text-left shadow-sm ring-1 ring-white/50 backdrop-blur-md transition-shadow ${
        selected ? "ring-2 ring-stone-400/60 shadow-md" : "hover:shadow-md"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500">{record.meetingDate}</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">{record.meetingTitle}</h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{record.meetingType} meeting</p>
        </div>
        <MinutesStatusPill status={record.status} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{record.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <MinutesPublicVisibilityTag publicVisible={record.publicVisible} />
        <span className="text-xs text-stone-600">
          {decisions} decision{decisions === 1 ? "" : "s"} · {followUps} open follow-up
        </span>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Prepared by {record.preparedBy}
        {record.approvedDate ? ` · Approved ${record.approvedDate}` : ""}
      </p>
    </article>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className="block w-full">
        {inner}
      </button>
    );
  }
  return inner;
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionTrackerTable } from "@/components/dashboard/ActionTrackerTable";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import {
  MeetingLifecyclePill,
  MeetingPublicBadge,
  MeetingTypeLabel,
  WorkflowAgendaList,
} from "@/components/meeting-workflow";
import { MinutesTimelineCard } from "@/components/minutes";
import { DiscussionThreadCard, VoteItemCard } from "@/components/voting";
import { ContentProtectionShell, SensitivityBadge } from "@/components/content-protection";
import { useDemoMode } from "@/lib/demo-mode-context";
import { logContentAccess } from "@/lib/audit/clientContentAccess";
import { actionsForMeeting, votesForMeeting } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { useEffect, useMemo, useRef } from "react";

export default function MeetingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const { profile } = useDemoMode();

  const meeting = useMemo(() => profile.boardMeetings.find((m) => m.id === id), [profile.boardMeetings, id]);
  const votes = profile.boardVotes;
  const minutes = profile.meetingMinutes;
  const meetingVotes = useMemo(() => (meeting ? votesForMeeting(meeting, votes) : []), [meeting, votes]);
  const minutesRec = useMemo(() => {
    if (!meeting?.minutesRecordId) return null;
    return minutes.find((r) => r.id === meeting.minutesRecordId) ?? null;
  }, [meeting, minutes]);

  const linkedActions = useMemo(() => {
    if (!meeting) return [];
    return actionsForMeeting(meeting, profile.actionItems);
  }, [meeting, profile.actionItems]);

  const discussionVotes = useMemo(() => {
    if (!meeting?.preMeetingDiscussionVoteIds?.length) return [];
    const set = new Set(meeting.preMeetingDiscussionVoteIds);
    return votes.filter((v) => set.has(v.id));
  }, [meeting, votes]);

  const loggedMeetingId = useRef<string | null>(null);
  useEffect(() => {
    if (!meeting?.id || loggedMeetingId.current === meeting.id) return;
    loggedMeetingId.current = meeting.id;
    logContentAccess({
      resourceType: "meeting",
      resourceKey: meeting.id,
      href: `/meetings/${meeting.id}`,
    });
  }, [meeting?.id]);

  if (!meeting) {
    return (
      <div className="space-y-4">
        <Link href="/meetings" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          Back to meetings
        </Link>
        <p className="text-stone-600">Meeting not found for this profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/meetings" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          All meetings
        </Link>
      </div>

      <section className="space-y-3 rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Section 1 - Overview</p>
        <h1 className="font-serif text-2xl font-semibold text-stone-900 md:text-3xl">{meeting.title}</h1>
        <p className="text-sm text-stone-600">{meeting.meetingDate}</p>
        <div className="flex flex-wrap gap-2">
          <MeetingTypeLabel type={meeting.meetingType} />
          <MeetingLifecyclePill status={meeting.status} />
          <MeetingPublicBadge publicVisible={meeting.publicVisible} />
        </div>
        {meeting.publicVisible ? (
          <p className="text-sm text-teal-900">
            Public meeting - agenda summaries and approved minutes can feed your website or board packet index.
          </p>
        ) : null}
      </section>

      <ContentProtectionShell blockContextMenu restrictSelection showViewOnlyHint>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SensitivityBadge variant={meeting.publicVisible ? "boardOnly" : "confidential"} />
        </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Agenda</h2>
        <p className="text-sm text-stone-600">Informational items and decisions tied to votes.</p>
        <WorkflowAgendaList items={meeting.agendaItems} />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Votes for this meeting</h2>
        <p className="text-sm text-stone-600">Inherited meeting context - same items appear in Voting.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {meetingVotes.length ? (
            meetingVotes.map((v) => <VoteItemCard key={v.id} vote={v} />)
          ) : (
            <p className="text-sm text-stone-500">No votes linked to this meeting.</p>
          )}
        </div>
        <Link href="/voting" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          Open voting workspace
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Pre-meeting discussion</h2>
        <p className="text-sm text-stone-600">Threads on linked votes before the meeting.</p>
        {discussionVotes.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {discussionVotes.map((v) => (
              <DiscussionThreadCard key={v.id} voteTitle={v.title} comments={v.discussionThread} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No discussion threads flagged for this meeting.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Minutes</h2>
        {minutesRec ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Record</p>
              <p className="mt-2 font-medium text-stone-900">{minutesRec.meetingTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{minutesRec.summary}</p>
              {minutesRec.publicSummary ? (
                <p className="mt-3 rounded-lg bg-teal-50/60 p-3 text-sm text-teal-950 ring-1 ring-teal-200/70">
                  <span className="font-semibold">Public summary: </span>
                  {minutesRec.publicSummary}
                </p>
              ) : null}
              <div className="mt-4">
                <Link href="/minutes" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
                  View all minutes
                </Link>
              </div>
            </div>
            <MinutesTimelineCard record={minutesRec} />
          </div>
        ) : (
          <p className="text-sm text-stone-500">Minutes not attached yet - coordinator can link when the record is ready.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-stone-900">Follow-up actions</h2>
        <p className="text-sm text-stone-600">From the meeting action id list.</p>
        {linkedActions.length ? (
          <ActionTrackerTable items={linkedActions} />
        ) : (
          <p className="text-sm text-stone-500">No actions tied to this meeting in demo data.</p>
        )}
      </section>
      </ContentProtectionShell>

      <InsightCallout>Sample workflow - connect to your calendar and document store when you go live.</InsightCallout>
    </div>
  );
}

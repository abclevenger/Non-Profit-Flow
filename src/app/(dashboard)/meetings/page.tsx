"use client";

import { InsightStrip } from "@/components/insights";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { MeetingRowCard, SimpleMeetingCalendar } from "@/components/meeting-workflow";
import { useDemoMode } from "@/lib/demo-mode-context";
import { buildGovernanceInsights, filterInsightsByHrefs } from "@/lib/insights/governanceInsights";
import { pastMeetings, upcomingMeetings } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { useMemo, useState } from "react";

export default function MeetingsPage() {
  const { profile } = useDemoMode();
  const meetings = profile.boardMeetings;
  const upcoming = useMemo(() => upcomingMeetings(meetings), [meetings]);
  const past = useMemo(() => pastMeetings(meetings), [meetings]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const meetingInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    return filterInsightsByHrefs(all, new Set(["/meetings"]));
  }, [profile]);

  const calAnchor = useMemo(() => {
    const m = upcoming[0] ?? past[0];
    if (!m) return { y: 2026, m: 3 };
    const [y, mo] = m.dateKey.split("-").map(Number);
    return { y, m: mo - 1 };
  }, [upcoming, past]);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Meeting workflow"
        description="One connected path from calendar to agenda, votes, minutes, and follow-up — a board command center, not a generic scheduler."
      />

      <InsightStrip
        insights={meetingInsights}
        title="Meeting cycle prompts"
        description="Cross-links from governance insights when this profile has upcoming sessions."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">Choose how you scan the cycle.</p>
        <div className="flex rounded-full bg-stone-200/60 p-1 ring-1 ring-stone-300/40">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              view === "list" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              view === "calendar" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      <InsightCallout title="How modules connect">
        Each meeting links agenda rows to votes, rolls up discussion before the date, attaches minutes when complete, and surfaces
        follow-up actions. Open any row for the full detail page.
      </InsightCallout>

      {profile.meetingPrepNotes ? (
        <InsightCallout title="Prep notes for leadership">{profile.meetingPrepNotes}</InsightCallout>
      ) : null}

      {view === "calendar" ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <SimpleMeetingCalendar meetings={meetings} year={calAnchor.y} monthIndex={calAnchor.m} />
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-stone-900">Upcoming</h2>
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MeetingRowCard key={m.id} meeting={m} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-stone-900">Upcoming meetings</h2>
            <p className="text-sm text-stone-600">Scheduled or in progress — decision readiness and public labels at a glance.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((m) => (
                <MeetingRowCard key={m.id} meeting={m} />
              ))}
            </div>
            {!upcoming.length ? <p className="text-sm text-stone-500">No upcoming meetings in this profile.</p> : null}
          </section>
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-stone-900">Past meetings</h2>
            <p className="text-sm text-stone-600">Completed sessions — open for minutes and outcomes.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((m) => (
                <MeetingRowCard key={m.id} meeting={m} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

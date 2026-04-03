"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDemoMode } from "@/lib/demo-mode-context";
import { ActionTrackerTable } from "@/components/dashboard/ActionTrackerTable";
import { AgendaCard } from "@/components/dashboard/AgendaCard";
import { DocumentListCard } from "@/components/dashboard/DocumentListCard";
import { ExecutiveUpdateCard } from "@/components/dashboard/ExecutiveUpdateCard";
import { GovernanceHealthCard } from "@/components/dashboard/GovernanceHealthCard";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { OrganizationSummary } from "@/components/dashboard/OrganizationSummary";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StrategicInsightCallout } from "@/components/strategy/StrategicInsightCallout";
import { StrategicPriorityList } from "@/components/strategy/StrategicPriorityList";
import { VoteItemCard } from "@/components/voting";
import { MeetingMinutesCard } from "@/components/minutes";
import { TrainingModuleCard } from "@/components/training";
import {
  minutesSortByDateDesc,
  openFollowUpCount,
  overviewMinutesSummaryLine,
} from "@/lib/minutes/minutesHelpers";
import {
  overviewRequiredModules,
  overviewTrainingSummaryLine,
  recommendedResourcesList,
} from "@/lib/training/trainingHelpers";
import {
  overviewVotingSummaryLine,
  votesOpen,
  votesRecentDecisions,
} from "@/lib/voting/voteHelpers";
import {
  decisionsRequiredCount,
  nextBoardMeeting,
  nextMeetingOverviewLine,
} from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { buildGovernanceInsights } from "@/lib/insights/governanceInsights";
import { InsightStrip, PeerComparisonWithProfileMetrics, ScenarioModelingPanel } from "@/components/insights";

export default function OverviewPage() {
  const { profile, profileId } = useDemoMode();
  const governanceInsights = useMemo(() => buildGovernanceInsights(profile), [profile]);
  const topPriorities = profile.strategicPriorities.slice(0, 3);
  const votes = profile.boardVotes;
  const upcomingVotes = votes
    .filter((v) => v.status === "Draft" || v.status === "Scheduled")
    .slice(0, 2);
  const openVote = votesOpen(votes).slice(0, 1);
  const recentDecisions = votesRecentDecisions(votes).slice(0, 2);
  const votingSummary = overviewVotingSummaryLine(votes);
  const training = profile.boardTraining;
  const trainingRequiredPreview = overviewRequiredModules(training, 2);
  const trainingRecommendedResource = recommendedResourcesList(training)[0];
  const trainingSummary = overviewTrainingSummaryLine(training);
  const minutesRec = profile.meetingMinutes;
  const minutesApprovedPreview = minutesSortByDateDesc(
    minutesRec.filter((r) => r.status === "Approved" || r.status === "Published"),
  )[0];
  const minutesDraftPreview = minutesSortByDateDesc(
    minutesRec.filter((r) => r.status === "Draft" || r.status === "In Review"),
  )[0];
  const minutesFollowUpOpen = openFollowUpCount(minutesRec);
  const minutesSummary = overviewMinutesSummaryLine(minutesRec);
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const nextMeetLine = nextMeetingOverviewLine(nextMeet, profile.boardVotes);
  const nextAgendaTop = nextMeet?.agendaItems.slice(0, 3) ?? [];
  const nextDecisionsRequired = nextMeet ? decisionsRequiredCount(nextMeet) : 0;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <SectionHeader
          title="Board overview"
          description="A sample strategic oversight dashboard for board members and leadership — priorities, readiness, risks, and records in one calm view."
        />
        <InsightCallout title="Built for discussion and planning">
          This dashboard is a preview for conversations with Mission Impact Legal Advisors. Tailored previews can be
          shaped around your organization, board cycle, and strategic focus.
        </InsightCallout>
      </div>

      <OrganizationSummary
        organizationName={profile.organizationName}
        missionSnippet={profile.missionSnippet}
        reportingPeriod={profile.reportingPeriod}
        boardChair={profile.boardChair}
        executiveDirector={profile.executiveDirector}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <InsightStrip insights={governanceInsights} />
        <div className="space-y-6">
          <ScenarioModelingPanel profile={profile} />
          <PeerComparisonWithProfileMetrics profileId={profileId} profile={profile} />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Next meeting"
          description="What is on deck for the board cycle — agenda focus and how many items need a decision."
        />
        {nextMeet ? (
          <>
            <p className="mb-3 text-sm font-medium text-stone-800">{nextMeetLine}</p>
            <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Scheduled</p>
              <p className="mt-1 font-serif text-xl font-semibold text-stone-900">{nextMeet.title}</p>
              <p className="mt-1 text-sm text-stone-600">{nextMeet.meetingDate}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Top agenda items · {nextDecisionsRequired} decision{nextDecisionsRequired === 1 ? "" : "s"} required
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-700">
                {nextAgendaTop.map((item) => (
                  <li key={item.id}>
                    {item.title}
                    {!item.informational && item.linkedVoteId ? (
                      <span className="ml-2 text-xs font-semibold text-rose-800">Decision</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-4">
              <Link
                href={`/meetings/${nextMeet.id}`}
                className="text-sm font-semibold text-stone-800 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
              >
                Open meeting workspace
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-stone-500">No upcoming meeting in this demo profile.</p>
        )}
      </section>


      <section>
        <SectionHeader
          title="Strategic priorities"
          description="A quick read on what leadership is driving — progress, owners, and the next milestone."
        />
        <StrategicInsightCallout priorities={profile.strategicPriorities} />
        <div className="mt-6">
          <StrategicPriorityList priorities={topPriorities} compact />
        </div>
        <div className="mt-5">
          <Link
            href="/strategy"
            className="text-sm font-semibold text-stone-800 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
          >
            View all priorities
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Board voting & decisions"
          description="Upcoming votes, open windows, and recent outcomes — with space for questions before decisions land."
        />
        <p className="mb-4 text-sm text-stone-600">{votingSummary}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Upcoming</p>
            {upcomingVotes.map((v) => (
              <VoteItemCard key={v.id} vote={v} />
            ))}
          </div>
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Open for vote</p>
            {openVote.length ? (
              openVote.map((v) => <VoteItemCard key={v.id} vote={v} />)
            ) : (
              <p className="text-sm text-stone-500">No active votes right now.</p>
            )}
          </div>
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Recent decisions</p>
            {recentDecisions.map((v) => (
              <VoteItemCard key={v.id} vote={v} />
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Link
            href="/voting"
            className="text-sm font-semibold text-stone-800 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
          >
            View all voting activity
          </Link>
        </div>
      </section>


      <section>
        <SectionHeader
          title="Board member training"
          description="Orientation topics, key documents, and progress — a calm path for new members to get confident quickly."
        />
        <p className="mb-4 text-sm text-stone-600">{trainingSummary}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Onboarding progress</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">{training.progress.percentComplete}%</p>
            <p className="mt-1 text-sm text-stone-600">
              {training.progress.completedCount} of {training.modules.length} modules started or complete (demo).
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200/80">
              <div
                className="h-full rounded-full bg-stone-800/90"
                style={{ width: `${training.progress.percentComplete}%` }}
              />
            </div>
          </div>
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Required modules</p>
            {trainingRequiredPreview.map((m) => (
              <TrainingModuleCard key={m.id} module={m} />
            ))}
          </div>
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Recommended resource</p>
            {trainingRecommendedResource ? (
              <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
                <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80">
                  Recommended
                </span>
                <p className="mt-2 font-medium text-stone-900">{trainingRecommendedResource.title}</p>
                <p className="mt-1 text-sm text-stone-600">{trainingRecommendedResource.description}</p>
                <p className="mt-2 text-xs text-stone-500">Updated {trainingRecommendedResource.lastUpdated}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-500">No highlighted resources.</p>
            )}
          </div>
        </div>
        <div className="mt-5">
          <Link
            href="/training"
            className="text-sm font-semibold text-stone-800 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
          >
            View training
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Meeting minutes & records"
          description="Official records, approval status, and open follow-up from recent meetings."
        />
        <p className="mb-4 text-sm text-stone-600">{minutesSummary}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Recent approved</p>
            {minutesApprovedPreview ? (
              <MeetingMinutesCard record={minutesApprovedPreview} />
            ) : (
              <p className="text-sm text-stone-500">No approved records yet.</p>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Draft or in review</p>
            {minutesDraftPreview ? (
              <MeetingMinutesCard record={minutesDraftPreview} />
            ) : (
              <p className="text-sm text-stone-500">No drafts in the queue.</p>
            )}
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Open follow-up items</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">{minutesFollowUpOpen}</p>
            <p className="mt-1 text-sm text-stone-600">Across all meeting records in this demo profile.</p>
          </div>
        </div>
        <div className="mt-5">
          <Link
            href="/minutes"
            className="text-sm font-semibold text-stone-800 underline-offset-4 transition-colors hover:text-stone-950 hover:underline"
          >
            View all minutes
          </Link>
        </div>
      </section>


      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeader title="Board agenda snapshot" description="What is coming to the next meeting." />
          <AgendaCard agenda={profile.boardAgenda} />
        </div>
        <div>
          <SectionHeader title="Risk overview" description="Board-level visibility — not a substitute for detailed risk management." />
          <div className="space-y-4">
            {profile.risks.map((r) => (
              <RiskCard key={r.category} {...r} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Key metrics" description="A few indicators the board tracks between deeper dives." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {profile.keyMetrics.map((m) => (
            <StatCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      <section>
        <ExecutiveUpdateCard update={profile.executiveUpdate} />
      </section>

      <section>
        <ActionTrackerTable items={profile.actionItems} />
      </section>

      <section>
        <GovernanceHealthCard items={profile.governance} />
      </section>

      <section>
        <DocumentListCard documents={profile.documents} logAccess />
      </section>

      <InsightCallout>
        <span className="font-medium text-stone-800">Illustrative preview — not live data.</span> Numbers and items are
        samples for discussion only.
      </InsightCallout>
    </div>
  );
}
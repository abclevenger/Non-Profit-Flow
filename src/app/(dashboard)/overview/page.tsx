"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { canAccessVotingWorkspace } from "@/lib/auth/permissions";
import { isMemberRole } from "@/lib/auth/roles";
import {
  BoardReadinessBar,
  FocusHeroCard,
  OverviewMoreDetailsTabs,
  QuickStatsRow,
  ThisWeekFlow,
} from "@/components/overview";
import { ActionTrackerTable } from "@/components/dashboard/ActionTrackerTable";
import { AgendaCard } from "@/components/dashboard/AgendaCard";
import { DocumentListCard } from "@/components/dashboard/DocumentListCard";
import { ExecutiveUpdateCard } from "@/components/dashboard/ExecutiveUpdateCard";
import { GovernanceHealthCard } from "@/components/dashboard/GovernanceHealthCard";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { OrganizationSummary } from "@/components/dashboard/OrganizationSummary";
import { RiskCard } from "@/components/dashboard/RiskCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StrategicInsightCallout } from "@/components/strategy/StrategicInsightCallout";
import { StrategicPriorityList } from "@/components/strategy/StrategicPriorityList";
import { VoteItemCard } from "@/components/voting";
import { MeetingMinutesCard } from "@/components/minutes";
import { TrainingModuleCard } from "@/components/training";
import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";
import { ExpertReviewOverviewWidget } from "@/components/expert-review/ExpertReviewOverviewWidget";
import { RequestReviewToolbar } from "@/components/expert-review/RequestReviewToolbar";
import { GcReviewOverviewWidget } from "@/components/gc-review/GcReviewOverviewWidget";
import { InsightStrip, PeerComparisonWithProfileMetrics, ScenarioModelingPanel } from "@/components/insights";
import { useDemoMode } from "@/lib/demo-mode-context";
import { logContentAccess } from "@/lib/audit/clientContentAccess";
import { buildGovernanceInsights } from "@/lib/insights/governanceInsights";
import {
  computeBoardReadinessPercent,
  filterInsightsForAttention,
} from "@/lib/overview/overviewDashboardModel";
import {
  buildFocusHeroCards,
  buildQuickStats,
  buildThisWeekSteps,
} from "@/lib/overview/overviewFocusModel";
import {
  minutesSortByDateDesc,
  overviewMinutesSummaryLine,
} from "@/lib/minutes/minutesHelpers";
import { overviewRequiredModules, overviewTrainingSummaryLine } from "@/lib/training/trainingHelpers";
import { votesOpen, votesRecentDecisions } from "@/lib/voting/voteHelpers";
import {
  decisionsRequiredCount,
  nextBoardMeeting,
  nextMeetingOverviewLine,
} from "@/lib/meeting-workflow/meetingWorkflowHelpers";

export default function OverviewPage() {
  const { profile, profileId, organizationId } = useDemoMode();
  const { data: session, status } = useSession();
  const canOpenVoting = useMemo(() => {
    if (status !== "authenticated" || !session?.user?.role) return false;
    const r = session.user.role;
    return isMemberRole(r) && canAccessVotingWorkspace(r);
  }, [session?.user?.role, status]);

  const governanceInsights = useMemo(() => buildGovernanceInsights(profile), [profile]);
  const attentionInsights = useMemo(() => filterInsightsForAttention(profile), [profile]);
  const focusCards = useMemo(
    () => buildFocusHeroCards(profile, { canOpenVoting: canOpenVoting }),
    [profile, canOpenVoting],
  );
  const quickStats = useMemo(() => buildQuickStats(profile), [profile]);
  const weekSteps = useMemo(
    () => buildThisWeekSteps(profile, { canOpenVoting: canOpenVoting }),
    [profile, canOpenVoting],
  );
  const readinessPercent = useMemo(() => computeBoardReadinessPercent(profile), [profile]);

  const votes = profile.boardVotes;
  const upcomingVotes = votes.filter((v) => v.status === "Draft" || v.status === "Scheduled").slice(0, 3);
  const openVote = votesOpen(votes);
  const recentDecisions = votesRecentDecisions(votes).slice(0, 2);
  const training = profile.boardTraining;
  const trainingRequiredPreview = overviewRequiredModules(training, 3);
  const trainingSummary = overviewTrainingSummaryLine(training);
  const minutesRec = profile.meetingMinutes;
  const minutesApprovedPreview = minutesSortByDateDesc(
    minutesRec.filter((r) => r.status === "Approved" || r.status === "Published"),
  )[0];
  const minutesSummary = overviewMinutesSummaryLine(minutesRec);
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const nextMeetLine = nextMeetingOverviewLine(nextMeet, profile.boardVotes);
  const nextAgendaTop = useMemo(
    () => nextMeet?.agendaItems.slice(0, 5) ?? [],
    [nextMeet],
  );
  const nextDecisionsRequired = nextMeet ? decisionsRequiredCount(nextMeet) : 0;
  const prepareHref = nextMeet ? `/meetings/${nextMeet.id}` : "/meetings";

  const logPrepare = () => {
    if (nextMeet) {
      logContentAccess({
        resourceType: "meeting_list",
        resourceKey: nextMeet.id,
        href: prepareHref,
      });
    }
  };

  const moreTabs = useMemo(
    () => [
      {
        id: "insights",
        label: "Insights & readiness",
        content: (
          <>
            <BoardReadinessBar percent={readinessPercent} />
            {attentionInsights.length > 0 ? (
              <InsightStrip
                insights={attentionInsights}
                title="Needs attention"
                description="Risk- and attention-level prompts."
                maxVisible={5}
                followInsightHref={(h) => h !== "/voting" || canOpenVoting}
              />
            ) : null}
            <InsightStrip
              insights={governanceInsights}
              title="All insights"
              description="Full planning prompts for this profile."
              followInsightHref={(h) => h !== "/voting" || canOpenVoting}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <ScenarioModelingPanel profile={profile} />
              <PeerComparisonWithProfileMetrics profileId={profileId} profile={profile} />
            </div>
          </>
        ),
      },
      {
        id: "strategy",
        label: "Strategy & governance",
        content: (
          <>
            <OrganizationSummary
              organizationName={profile.organizationName}
              missionSnippet={profile.missionSnippet}
              reportingPeriod={profile.reportingPeriod}
              boardChair={profile.boardChair}
              executiveDirector={profile.executiveDirector}
            />
            <StrategicInsightCallout priorities={profile.strategicPriorities} />
            <StrategicPriorityList
              priorities={profile.strategicPriorities}
              showInlineNote={false}
              organizationIdForGc={organizationId ?? undefined}
            />
            <GovernanceHealthCard items={profile.governance} />
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">Risk map</p>
              <div className="space-y-4">
                {profile.risks.map((r) => (
                  <RiskCard
                    key={r.category}
                    {...r}
                    gcReviewFooter={
                      <BoardItemReviewActions
                        organizationId={organizationId ?? ""}
                        gcItemType="procurement"
                        expertItemType="procurement"
                        itemId={`procurement-${encodeURIComponent(r.category).slice(0, 120)}`}
                        itemTitle={r.category}
                        relatedHref="/risks"
                        compact
                      />
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">Key metrics</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {profile.keyMetrics.map((m) => (
                  <StatCard key={m.label} {...m} />
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        id: "meetings",
        label: "Meetings & votes",
        content: (
          <>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">Agenda snapshot</p>
              <AgendaCard agenda={profile.boardAgenda} organizationIdForGc={organizationId ?? undefined} />
            </div>
            {nextMeet ? (
              <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm ring-1 ring-stone-100/80">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Next meeting</p>
                <p className="mt-2 font-serif text-xl font-semibold text-stone-900">{nextMeet.title}</p>
                <p className="mt-1 text-sm text-stone-600">{nextMeet.meetingDate}</p>
                <p className="mt-3 text-sm text-stone-700">{nextMeetLine}</p>
                <p className="mt-3 text-xs font-bold uppercase text-stone-500">
                  {nextDecisionsRequired} decision{nextDecisionsRequired === 1 ? "" : "s"} linked
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
                  {nextAgendaTop.map((item) => (
                    <li key={item.id}>{item.title}</li>
                  ))}
                </ul>
                <Link
                  href={`/meetings/${nextMeet.id}`}
                  onPointerDown={() =>
                    logContentAccess({
                      resourceType: "meeting_list",
                      resourceKey: nextMeet.id,
                      href: `/meetings/${nextMeet.id}`,
                    })
                  }
                  className="mt-4 inline-block text-sm font-semibold text-stone-900 underline-offset-4 hover:underline"
                >
                  Open workspace →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-stone-600">
                <Link href="/meetings" className="font-semibold underline-offset-2 hover:underline">
                  Browse meetings
                </Link>
              </p>
            )}
            {canOpenVoting ? (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Voting workspace</p>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-stone-500">Open</p>
                    {openVote.slice(0, 2).map((v) => (
                      <VoteItemCard key={v.id} vote={v} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-stone-500">Upcoming</p>
                    {upcomingVotes.map((v) => (
                      <VoteItemCard key={v.id} vote={v} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-stone-500">Recent</p>
                    {recentDecisions.map((v) => (
                      <VoteItemCard key={v.id} vote={v} />
                    ))}
                  </div>
                </div>
                <Link href="/voting" className="text-sm font-semibold text-stone-900 underline-offset-4 hover:underline">
                  Full voting view →
                </Link>
              </div>
            ) : null}
          </>
        ),
      },
      {
        id: "records",
        label: "Records & packet",
        content: (
          <>
            <ExecutiveUpdateCard update={profile.executiveUpdate} />
            <ActionTrackerTable items={profile.actionItems} organizationIdForGc={organizationId ?? undefined} />
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Training</p>
              <p className="text-sm text-stone-600">{trainingSummary}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {trainingRequiredPreview.map((m) => (
                  <div key={m.id} className="space-y-2">
                    <TrainingModuleCard module={m} />
                    <RequestReviewToolbar
                      relatedItemType="training"
                      relatedItemId={`training-${m.id}`}
                      relatedItemTitle={m.title}
                      relatedHref="/training"
                      compact
                    />
                  </div>
                ))}
              </div>
              <Link href="/training" className="mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline">
                Training hub →
              </Link>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Minutes</p>
              <p className="text-sm text-stone-600">{minutesSummary}</p>
              {minutesApprovedPreview ? (
                <div className="mt-4 max-w-lg">
                  <MeetingMinutesCard record={minutesApprovedPreview} />
                </div>
              ) : null}
              <Link href="/minutes" className="mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline">
                All minutes →
              </Link>
            </div>
            <DocumentListCard documents={profile.documents} logAccess organizationIdForGc={organizationId ?? undefined} />
          </>
        ),
      },
    ],
    [
      profile,
      profileId,
      organizationId,
      governanceInsights,
      attentionInsights,
      canOpenVoting,
      nextMeet,
      nextMeetLine,
      nextAgendaTop,
      nextDecisionsRequired,
      openVote,
      upcomingVotes,
      recentDecisions,
      trainingSummary,
      trainingRequiredPreview,
      minutesSummary,
      minutesApprovedPreview,
      readinessPercent,
    ],
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Primary CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          <span className="font-medium text-stone-800">{profile.organizationName}</span>
          <span className="text-stone-400"> · </span>
          {profile.reportingPeriod}
        </p>
        <Link
          href={prepareHref}
          onPointerDown={logPrepare}
          className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-2xl px-8 py-3.5 text-center text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          style={{
            backgroundColor: "var(--demo-accent, #6b5344)",
            color: "var(--demo-accent-foreground, #faf8f5)",
          }}
        >
          Prepare next meeting
        </Link>
      </div>

      {/* Hero focus */}
      <section className="space-y-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Here&apos;s what your board needs to focus on
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {focusCards.map((c) => (
            <FocusHeroCard
              key={c.id}
              variant={c.variant}
              title={c.title}
              body={c.body}
              cta={c.cta}
              href={c.href}
              disabled={c.disabled}
            />
          ))}
        </div>
      </section>

      {/* This week */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">This week</h2>
        <p className="max-w-2xl text-sm text-stone-600">A simple flow from decisions through follow-up — tap any link to continue.</p>
        <ThisWeekFlow steps={weekSteps} />
      </section>

      {/* Quick stats */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Quick insights</h2>
        <QuickStatsRow stats={quickStats} />
      </section>

      <GcReviewOverviewWidget />

      <ExpertReviewOverviewWidget />

      {/* Collapsed depth */}
      <OverviewMoreDetailsTabs tabs={moreTabs} />

      <InsightCallout>
        <span className="font-medium text-stone-800">Illustrative preview — not live data.</span> Use tabs above for the
        full mock packet.
      </InsightCallout>
    </div>
  );
}

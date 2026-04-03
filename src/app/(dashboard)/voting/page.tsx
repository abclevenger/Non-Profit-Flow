"use client";

import { useMemo, useState } from "react";
import { ContentProtectionShell, SensitivityBadge } from "@/components/content-protection";
import { InsightStrip } from "@/components/insights";
import { useDemoMode } from "@/lib/demo-mode-context";
import { buildGovernanceInsights, filterInsightsForVotes } from "@/lib/insights/governanceInsights";
import {
  CoordinatorControlsCard,
  DiscussionThreadCard,
  QuestionComposer,
  VoteItemCard,
  VotingHeader,
  VotingSummaryCards,
  VoteTimelineCard,
} from "@/components/voting";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";
import { RequestReviewToolbar } from "@/components/expert-review/RequestReviewToolbar";
import {
  votesDecisionsDueSoon,
  votesNeedFollowUp,
  votesOpen,
  votesRecentDecisions,
  votesUpcoming,
  votingSummaryStats,
} from "@/lib/voting/voteHelpers";
import type { BoardVoteItem } from "@/lib/mock-data/types";
import { logContentAccess } from "@/lib/audit/clientContentAccess";

export default function VotingPage() {
  const { profile, organizationId } = useDemoMode();
  const votes = profile.boardVotes;

  const upcoming = useMemo(() => {
    const u = votesUpcoming(votes);
    return u.filter((v) => v.status === "Draft" || v.status === "Scheduled" || v.status === "Open for Vote");
  }, [votes]);

  const dueSoon = useMemo(() => votesDecisionsDueSoon(votes), [votes]);
  const recent = useMemo(() => votesRecentDecisions(votes), [votes]);
  const followUps = useMemo(() => votesNeedFollowUp(votes), [votes]);
  const stats = useMemo(() => votingSummaryStats(votes), [votes]);

  const voteInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    const ids = new Set(votes.map((v) => v.id));
    return filterInsightsForVotes(all, ids);
  }, [profile, votes]);

  const featured = useMemo(() => {
    const open = votesOpen(votes)[0];
    return open ?? upcoming[0] ?? votes[0];
  }, [votes, upcoming]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: BoardVoteItem | null = useMemo(() => {
    if (selectedId) return votes.find((v) => v.id === selectedId) ?? featured;
    return featured;
  }, [selectedId, votes, featured]);

  const auditVoteOpen = (v: BoardVoteItem) => {
    logContentAccess({
      resourceType: "vote",
      resourceKey: v.id,
      href: "/voting",
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <VotingHeader />
        <SensitivityBadge variant="boardOnly" />
      </div>
      <InsightStrip
        insights={voteInsights}
        title="Voting & decisions — insights"
        description="Prompts tied to this demo’s vote records and board rhythm."
      />
      <InsightCallout title="How to use this in a real board cycle">
        Coordinators set open and close times and decision deadlines; members review the same item, ask questions, and
        follow the thread before the vote. In production this can connect to agendas, minutes, and public posting.
      </InsightCallout>

      <VotingSummaryCards stats={stats} />

      <ContentProtectionShell blockContextMenu restrictSelection showViewOnlyHint>
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Upcoming & active</h2>
          <p className="text-sm text-stone-600">Draft, scheduled, and open votes — review and discussion happen before the decision deadline.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((v) => (
              <button
                key={v.id}
                type="button"
                onPointerDown={() => auditVoteOpen(v)}
                onClick={() => setSelectedId(v.id)}
                className="text-left"
              >
                <VoteItemCard
                  vote={v}
                  gcReviewFooter={
                    <BoardItemReviewActions
                      organizationId={organizationId ?? ""}
                      gcItemType="vote"
                      expertItemType="vote"
                      itemId={v.id}
                      itemTitle={v.title}
                      relatedHref="/voting"
                      compact
                    />
                  }
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Decisions due soon</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {dueSoon.map((v) => (
              <button
                key={v.id}
                type="button"
                onPointerDown={() => auditVoteOpen(v)}
                onClick={() => setSelectedId(v.id)}
                className="text-left"
              >
                <VoteItemCard
                  vote={v}
                  urgency="closingSoon"
                  gcReviewFooter={
                    <BoardItemReviewActions
                      organizationId={organizationId ?? ""}
                      gcItemType="vote"
                      expertItemType="vote"
                      itemId={v.id}
                      itemTitle={v.title}
                      relatedHref="/voting"
                      compact
                    />
                  }
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Recent decisions</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {recent.map((v) => (
              <button
                key={v.id}
                type="button"
                onPointerDown={() => auditVoteOpen(v)}
                onClick={() => setSelectedId(v.id)}
                className="text-left"
              >
                <VoteItemCard
                  vote={v}
                  gcReviewFooter={
                    <BoardItemReviewActions
                      organizationId={organizationId ?? ""}
                      gcItemType="vote"
                      expertItemType="vote"
                      itemId={v.id}
                      itemTitle={v.title}
                      relatedHref="/voting"
                      compact
                    />
                  }
                />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Follow-up needed</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {followUps.map((v) => (
              <button
                key={v.id}
                type="button"
                onPointerDown={() => auditVoteOpen(v)}
                onClick={() => setSelectedId(v.id)}
                className="text-left"
              >
                <VoteItemCard
                  vote={v}
                  urgency="followUp"
                  gcReviewFooter={
                    <BoardItemReviewActions
                      organizationId={organizationId ?? ""}
                      gcItemType="vote"
                      expertItemType="vote"
                      itemId={v.id}
                      itemTitle={v.title}
                      relatedHref="/voting"
                      compact
                    />
                  }
                />
              </button>
            ))}
          </div>
        </section>

        {selected ? (
          <section className="space-y-4 border-t border-stone-200/80 pt-10">
            <h2 className="font-serif text-xl font-semibold text-stone-900">Discussion & coordinator view</h2>
            <p className="text-sm text-stone-600">Selected: {selected.title}</p>
            <div className="grid gap-6 lg:grid-cols-2">
              <DiscussionThreadCard
                voteTitle={selected.title}
                comments={selected.discussionThread}
                footer={
                  <RequestReviewToolbar
                    relatedItemType="discussion"
                    relatedItemId={`discussion-${selected.id}`}
                    relatedItemTitle={`Discussion: ${selected.title}`}
                    relatedHref="/voting"
                    compact
                  />
                }
              />
              <VoteTimelineCard vote={selected} />
            </div>
            <QuestionComposer voteTitle={selected.title} />
            <CoordinatorControlsCard vote={selected} />
          </section>
        ) : null}
      </ContentProtectionShell>

      <p className="text-center text-xs text-stone-500">Illustrative preview — not live voting.</p>
    </div>
  );
}

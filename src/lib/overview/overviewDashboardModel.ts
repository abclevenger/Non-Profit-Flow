import type { OrganizationProfile } from "@/lib/mock-data/types";
import { buildGovernanceInsights } from "@/lib/insights/governanceInsights";
import { daysUntilMeeting, nextBoardMeeting, WORKFLOW_TODAY } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { votesOpen } from "@/lib/voting/voteHelpers";

export type StartHereTone = "urgent" | "attention" | "ok" | "muted";

export type StartHereCardModel = {
  id: string;
  tone: StartHereTone;
  title: string;
  subtitle: string;
  href: string;
  /** When true, render as non-link with subtitle explaining */
  disabled?: boolean;
};

function complianceDueSoonCount(profile: OrganizationProfile): number {
  const rows = profile.complianceCalendar ?? [];
  return rows.filter(
    (c) => /due|file|submit|renew/i.test(c.label) && !/complete|filed/i.test(c.status),
  ).length;
}

/**
 * Priority cards for the top of the overview — sorted urgent → muted, max `limit`.
 */
export function buildStartHereCards(
  profile: OrganizationProfile,
  opts: { canOpenVoting: boolean; limit?: number },
): StartHereCardModel[] {
  const limit = opts.limit ?? 5;
  const votes = profile.boardVotes;
  const open = votesOpen(votes);
  const drafts = votes.filter((v) => v.status === "Draft");
  const overdue = profile.actionItems.filter((a) => a.overdue);
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const days = nextMeet ? daysUntilMeeting(nextMeet.dateKey, WORKFLOW_TODAY) : null;
  const highRisks = profile.risks.filter((r) => r.status === "High").length;
  const complianceN = complianceDueSoonCount(profile);
  const requiredIncomplete = profile.boardTraining.modules.filter(
    (m) => m.required && m.status !== "Complete",
  ).length;

  const cards: StartHereCardModel[] = [];

  if (open.length > 0) {
    cards.push({
      id: "open-votes",
      tone: "urgent",
      title: `${open.length} decision${open.length === 1 ? "" : "s"} open for review`,
      subtitle: "Review discussion and vote before the window closes.",
      href: "/voting",
      disabled: !opts.canOpenVoting,
    });
  }

  if (overdue.length > 0) {
    cards.push({
      id: "overdue-actions",
      tone: "urgent",
      title: `${overdue.length} board action${overdue.length === 1 ? "" : "s"} overdue`,
      subtitle: "Catch up before the next packet or audit narrative.",
      href: "/overview#section-attention-actions",
    });
  }

  if (highRisks > 0) {
    cards.push({
      id: "high-risk",
      tone: "urgent",
      title: `${highRisks} high-severity risk area${highRisks === 1 ? "" : "s"}`,
      subtitle: "Confirm mitigation and board education on the risk map.",
      href: "/risks",
    });
  }

  if (drafts.length >= 2) {
    cards.push({
      id: "draft-votes",
      tone: "attention",
      title: `${drafts.length} votes still in draft`,
      subtitle: "Schedule or packet materials may be blocking reviewers.",
      href: "/voting",
      disabled: !opts.canOpenVoting,
    });
  }

  if (complianceN > 0) {
    cards.push({
      id: "compliance",
      tone: "attention",
      title: `${complianceN} compliance item${complianceN === 1 ? "" : "s"} to watch`,
      subtitle: "Filings and renewals on the governance calendar.",
      href: "/governance",
    });
  }

  if (nextMeet && days !== null) {
    if (days < 0) {
      cards.push({
        id: "meeting-past",
        tone: "muted",
        title: "Next scheduled session",
        subtitle: nextMeet.title,
        href: `/meetings/${nextMeet.id}`,
      });
    } else if (days <= 3) {
      cards.push({
        id: "meeting-soon",
        tone: days === 0 ? "urgent" : "attention",
        title: days === 0 ? "Board meeting is today" : `Next meeting in ${days} day${days === 1 ? "" : "s"}`,
        subtitle: nextMeet.title,
        href: `/meetings/${nextMeet.id}`,
      });
    } else if (days <= 14) {
      cards.push({
        id: "meeting-upcoming",
        tone: "attention",
        title: `Next meeting in ${days} days`,
        subtitle: nextMeet.title,
        href: `/meetings/${nextMeet.id}`,
      });
    } else {
      cards.push({
        id: "meeting-far",
        tone: "ok",
        title: `Next meeting in ${days} days`,
        subtitle: nextMeet.title,
        href: `/meetings/${nextMeet.id}`,
      });
    }
  }

  if (requiredIncomplete > 0) {
    cards.push({
      id: "training",
      tone: "attention",
      title: `${requiredIncomplete} required training topic${requiredIncomplete === 1 ? "" : "s"} open`,
      subtitle: "Finish orientation modules ahead of major votes.",
      href: "/training",
    });
  }

  const trainingPct = profile.boardTraining.progress.percentComplete;
  if (
    cards.filter((c) => c.tone === "urgent" || c.tone === "attention").length === 0 &&
    cards.length < limit
  ) {
    cards.push({
      id: "engagement",
      tone: trainingPct >= 85 ? "ok" : "ok",
      title: trainingPct >= 85 ? "Board engagement looks strong" : "Orientation progressing",
      subtitle:
        trainingPct >= 85
          ? "Training progress and rhythm are in a good range for this demo."
          : `${trainingPct}% of orientation complete — keep momentum before the next cycle.`,
      href: "/training",
    });
  }

  const toneOrder: Record<StartHereTone, number> = {
    urgent: 0,
    attention: 1,
    ok: 2,
    muted: 3,
  };
  cards.sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone]);

  const seen = new Set<string>();
  const deduped = cards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return deduped.slice(0, limit);
}

export function computeBoardReadinessPercent(profile: OrganizationProfile): number {
  const open = votesOpen(profile.boardVotes).length;
  const overdue = profile.actionItems.filter((a) => a.overdue).length;
  const high = profile.risks.filter((r) => r.status === "High").length;
  const complianceN = complianceDueSoonCount(profile);
  const training = profile.boardTraining.progress.percentComplete;
  const incompleteReq = profile.boardTraining.modules.filter(
    (m) => m.required && m.status !== "Complete",
  ).length;

  const score =
    38 +
    training * 0.42 -
    Math.min(18, overdue * 6) -
    Math.min(14, open * 5) -
    high * 10 -
    Math.min(12, complianceN * 4) -
    Math.min(10, incompleteReq * 3);

  return Math.max(38, Math.min(96, Math.round(score)));
}

export function filterInsightsForAttention(profile: OrganizationProfile) {
  return buildGovernanceInsights(profile).filter((i) => i.severity === "risk" || i.severity === "attention");
}

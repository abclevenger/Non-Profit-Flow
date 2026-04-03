import type { OrganizationProfile } from "@/lib/mock-data/types";
import { upcomingMeetings } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import type { GovernanceInsight } from "./types";

const severityOrder: Record<GovernanceInsight["severity"], number> = {
  risk: 0,
  attention: 1,
  info: 2,
};

/**
 * Derives proactive governance prompts from mock profile data (demo — extend with real dates/API later).
 */
export function buildGovernanceInsights(profile: OrganizationProfile): GovernanceInsight[] {
  const insights: GovernanceInsight[] = [];
  const votes = profile.boardVotes;

  const drafts = votes.filter((v) => v.status === "Draft");
  if (drafts.length >= 2) {
    insights.push({
      id: "multi-draft",
      severity: "attention",
      title: "Multiple votes still in draft",
      detail: `${drafts.length} items have not been scheduled for decision — reviewers may be waiting on packet materials or briefs.`,
      href: "/voting",
      relatedVoteIds: drafts.map((v) => v.id),
    });
  }

  const openNoDiscussion = votes.filter(
    (v) => v.status === "Open for Vote" && v.discussionThread.length === 0,
  );
  if (openNoDiscussion.length > 0) {
    insights.push({
      id: "open-no-thread",
      severity: "info",
      title: "Open votes with no discussion yet",
      detail: "Consider prompting members to ask questions in the thread before the window closes.",
      href: "/voting",
      relatedVoteIds: openNoDiscussion.map((v) => v.id),
    });
  }

  const followUps = votes.filter((v) => v.followUpRequired || v.status === "Needs Follow-Up");
  if (followUps.length > 0) {
    insights.push({
      id: "vote-followup",
      severity: "attention",
      title: "Decisions need follow-up",
      detail: `${followUps.length} vote record(s) are flagged for follow-up — tie them to minutes and action items.`,
      href: "/voting",
      relatedVoteIds: followUps.map((v) => v.id),
    });
  }

  const atRisk = profile.strategicPriorities.filter((p) => p.status === "At Risk" || p.status === "Off Track");
  if (atRisk.length > 0 && drafts.length + votes.filter((v) => v.status === "Scheduled").length > 0) {
    insights.push({
      id: "strategy-votes",
      severity: "risk",
      title: "Strategic priorities need board attention",
      detail: `${atRisk.length} priority(ies) are off track while related decisions are still moving — align timeline in the next meeting.`,
      href: "/strategy",
    });
  }

  const overdueActions = profile.actionItems.filter((a) => a.overdue);
  if (overdueActions.length > 0) {
    insights.push({
      id: "overdue-actions",
      severity: "attention",
      title: "Overdue board actions",
      detail: `${overdueActions.length} action item(s) are past due — may affect readiness for grants or compliance narratives.`,
      href: "/overview",
    });
  }

  const minutesDraft = profile.meetingMinutes.filter((m) => m.status === "Draft" || m.status === "In Review");
  if (minutesDraft.length >= 2) {
    insights.push({
      id: "minutes-backlog",
      severity: "info",
      title: "Minutes backlog building",
      detail: `${minutesDraft.length} records are not approved yet — funders and auditors often expect timely records.`,
      href: "/minutes",
    });
  }

  const compliance = profile.complianceCalendar ?? [];
  const dueSoon = compliance.filter(
    (c) => /due|file|submit|renew/i.test(c.label) && !/complete|filed/i.test(c.status),
  );
  if (dueSoon.length > 0) {
    insights.push({
      id: "compliance-dates",
      severity: "attention",
      title: "Compliance calendar items to watch",
      detail: `${dueSoon.length} upcoming filing or renewal — confirm board packet coverage.`,
      href: "/governance",
    });
  }

  const requiredMods = profile.boardTraining.modules.filter((m) => m.required);
  const incompleteRequired = requiredMods.filter((m) => m.status !== "Complete");
  if (incompleteRequired.length > 0) {
    insights.push({
      id: "training-required-open",
      severity: "info",
      title: "Required orientation topics still open",
      detail: `${incompleteRequired.length} required module(s) are not marked complete in this demo — align onboarding before major decisions.`,
      href: "/training",
    });
  }

  const risks = profile.risks;
  const highRisks = risks.filter((r) => r.status === "High");
  if (highRisks.length > 0) {
    insights.push({
      id: "risk-high",
      severity: "risk",
      title: "High-severity risk on the board map",
      detail: `${highRisks.length} area(s) marked High — review owners, mitigations, and what the board should monitor between meetings.`,
      href: "/risks",
    });
  }

  const risingRisks = risks.filter((r) => r.trend === "rising");
  if (risingRisks.length > 0) {
    insights.push({
      id: "risk-rising",
      severity: "attention",
      title: "Risk area(s) trending up",
      detail: `${risingRisks.length} topic(s) flagged as rising — worth a focused discussion or deeper briefing.`,
      href: "/risks",
    });
  }

  const mediumRisks = risks.filter((r) => r.status === "Medium");
  const watchlisted = risks.filter((r) => r.watchlist);
  if (
    highRisks.length === 0 &&
    (mediumRisks.length >= 2 || watchlisted.length >= 2 || (mediumRisks.length >= 1 && watchlisted.length >= 1))
  ) {
    insights.push({
      id: "risk-multiple-focus",
      severity: "info",
      title: "Several board risk themes need alignment",
      detail:
        mediumRisks.length >= 2
          ? `${mediumRisks.length} categories are Medium — use the risk view to prioritize board time and owners.`
          : "Multiple watchlist or medium items deserve a shared read before major commitments.",
      href: "/risks",
    });
  }

  const upcomingMeet = upcomingMeetings(profile.boardMeetings);
  if (upcomingMeet.length > 0) {
    insights.push({
      id: "meetings-upcoming",
      severity: "info",
      title: "Meeting workflow has upcoming sessions",
      detail: `${upcomingMeet.length} meeting(s) scheduled or in progress — agenda, votes, and discussion are linked in one place.`,
      href: "/meetings",
    });
  }

  return insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function filterInsightsForVotes(
  insights: GovernanceInsight[],
  voteIds: Set<string>,
): GovernanceInsight[] {
  return insights.filter(
    (i) => !i.relatedVoteIds?.length || i.relatedVoteIds.some((id) => voteIds.has(id)),
  );
}

/** Keep insights whose primary link matches one of the given routes (e.g. strategy vs governance). */
export function filterInsightsByHrefs(
  insights: GovernanceInsight[],
  hrefs: Set<string>,
): GovernanceInsight[] {
  return insights.filter((i) => hrefs.has(i.href));
}

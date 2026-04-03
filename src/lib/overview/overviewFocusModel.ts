import type { OrganizationProfile } from "@/lib/mock-data/types";
import { openFollowUpCount } from "@/lib/minutes/minutesHelpers";
import { daysUntilMeeting, nextBoardMeeting, WORKFLOW_TODAY } from "@/lib/meeting-workflow/meetingWorkflowHelpers";
import { votesOpen } from "@/lib/voting/voteHelpers";

export type FocusCardVariant = "red" | "yellow" | "orange" | "green";

export type FocusHeroCardModel = {
  id: string;
  variant: FocusCardVariant;
  title: string;
  body: string;
  cta: string;
  href: string;
  disabled?: boolean;
};

function complianceDueSoon(profile: OrganizationProfile): number {
  const rows = profile.complianceCalendar ?? [];
  return rows.filter(
    (c) => /due|file|submit|renew/i.test(c.label) && !/complete|filed/i.test(c.status),
  ).length;
}

/** Four fixed hero cards — action-first copy driven by profile. */
export function buildFocusHeroCards(
  profile: OrganizationProfile,
  opts: { canOpenVoting: boolean },
): FocusHeroCardModel[] {
  const votes = profile.boardVotes;
  const open = votesOpen(votes);
  const waiting = open.length;
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const days = nextMeet ? daysUntilMeeting(nextMeet.dateKey, WORKFLOW_TODAY) : null;
  const complianceN = complianceDueSoon(profile);
  const trainingPct = profile.boardTraining.progress.percentComplete;
  const atRiskPri = profile.strategicPriorities.filter(
    (p) => p.status === "At Risk" || p.status === "Off Track",
  ).length;

  const decisionCard: FocusHeroCardModel =
    waiting > 0
      ? {
          id: "decision",
          variant: "red",
          title: "Decision needed",
          body: `${waiting} item${waiting === 1 ? "" : "s"} waiting for board review`,
          cta: "Review decision",
          href: "/voting",
          disabled: !opts.canOpenVoting,
        }
      : {
          id: "decision",
          variant: "red",
          title: "Decision needed",
          body: "No votes open right now — check upcoming items in the voting workspace.",
          cta: "View decisions",
          href: "/voting",
          disabled: !opts.canOpenVoting,
        };

  const meetingBody =
    nextMeet && days !== null
      ? days < 0
        ? `${nextMeet.title} is past — confirm minutes and follow-up.`
        : days === 0
          ? "Board meeting is today"
          : `Board meeting in ${days} day${days === 1 ? "" : "s"}`
      : "No upcoming session in this demo profile.";

  const meetingCard: FocusHeroCardModel = {
    id: "meeting",
    variant: "yellow",
    title: "Upcoming meeting",
    body: meetingBody,
    cta: "Prepare agenda",
    href: nextMeet ? `/meetings/${nextMeet.id}` : "/meetings",
  };

  const complianceCard: FocusHeroCardModel =
    complianceN > 0
      ? {
          id: "compliance",
          variant: "orange",
          title: "Compliance",
          body: `${complianceN} item${complianceN === 1 ? "" : "s"} need attention`,
          cta: "View issues",
          href: "/governance",
        }
      : {
          id: "compliance",
          variant: "orange",
          title: "Compliance",
          body: "No flagged filings on the sample calendar this week.",
          cta: "View calendar",
          href: "/governance",
        };

  const healthStrong = trainingPct >= 80 && atRiskPri === 0;
  const healthCard: FocusHeroCardModel = {
    id: "health",
    variant: "green",
    title: "Board health",
    body: healthStrong
      ? "Strong engagement this month"
      : atRiskPri > 0
        ? `${atRiskPri} strategic priority(ies) need attention`
        : "Orientation and rhythm are steady — review insights for detail.",
    cta: "View insights",
    href: "/strategy",
  };

  return [decisionCard, meetingCard, complianceCard, healthCard];
}

export type QuickStatModel = { label: string; value: string };

export function buildQuickStats(profile: OrganizationProfile): QuickStatModel[] {
  const attendance = profile.keyMetrics.find((m) => /attendance/i.test(m.label));
  const openMetric = profile.keyMetrics.find((m) => /open board action/i.test(m.label));
  const openActions = openMetric?.value ?? String(profile.actionItems.length);

  return [
    {
      label: attendance ? attendance.label.replace(/\s*\(YTD\)\s*/i, "").trim() : "Board attendance",
      value: attendance?.value ?? "—",
    },
    { label: "Open actions", value: openActions },
    { label: "Active initiatives", value: String(profile.strategicPriorities.length) },
  ];
}

export type ThisWeekStepModel = {
  id: string;
  label: string;
  items: { text: string; href?: string }[];
};

export function buildThisWeekSteps(
  profile: OrganizationProfile,
  opts: { canOpenVoting: boolean },
): ThisWeekStepModel[] {
  const votes = profile.boardVotes;
  const open = votesOpen(votes);
  const upcoming = votes.filter((v) => v.status === "Draft" || v.status === "Scheduled").slice(0, 2);
  const nextMeet = nextBoardMeeting(profile.boardMeetings);
  const followUps = profile.actionItems.slice(0, 2);
  const minutesFU = openFollowUpCount(profile.meetingMinutes);

  const decisionItems: { text: string; href?: string }[] = [];
  if (open[0]) decisionItems.push({ text: open[0].title, href: opts.canOpenVoting ? "/voting" : undefined });
  if (open[1]) decisionItems.push({ text: open[1].title, href: opts.canOpenVoting ? "/voting" : undefined });
  if (!decisionItems.length && upcoming[0]) {
    decisionItems.push({ text: upcoming[0].title, href: opts.canOpenVoting ? "/voting" : undefined });
    if (upcoming[1]) decisionItems.push({ text: upcoming[1].title, href: opts.canOpenVoting ? "/voting" : undefined });
  }
  if (!decisionItems.length) {
    decisionItems.push({ text: "No open decisions in this demo window." });
  }

  const meetingItems: { text: string; href?: string }[] = [];
  if (nextMeet) {
    meetingItems.push({ text: nextMeet.title, href: `/meetings/${nextMeet.id}` });
    meetingItems.push({ text: nextMeet.meetingDate });
  } else {
    meetingItems.push({ text: "Schedule or select a meeting in the workflow." });
  }

  const votingItems: { text: string; href?: string }[] = [];
  if (opts.canOpenVoting) {
    votingItems.push({ text: "Use the voting workspace for motions and discussion.", href: "/voting" });
    if (open[0]) votingItems.push({ text: `Active: ${open[0].title}`, href: "/voting" });
    else votingItems.push({ text: "Review scheduled votes before they open." });
  } else {
    votingItems.push({ text: "Voting workspace is limited for your role in this demo." });
  }

  const followItems: { text: string; href?: string }[] = [];
  if (minutesFU > 0) {
    followItems.push({ text: `${minutesFU} minutes follow-up item(s) open`, href: "/minutes" });
  }
  if (followUps[0]) {
    followItems.push({ text: followUps[0].task, href: "/minutes" });
  }
  if (followUps[1] && followItems.length < 2) {
    followItems.push({ text: followUps[1].task });
  }
  if (!followItems.length) {
    followItems.push({ text: "No follow-ups surfaced in this preview." });
  }

  return [
    { id: "decisions", label: "Decisions", items: decisionItems.slice(0, 2) },
    { id: "meeting", label: "Meeting", items: meetingItems.slice(0, 2) },
    { id: "voting", label: "Voting", items: votingItems.slice(0, 2) },
    { id: "followup", label: "Follow-up", items: followItems.slice(0, 2) },
  ];
}


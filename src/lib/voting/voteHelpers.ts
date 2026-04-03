import type { BoardVoteItem, BoardVoteStatus } from "@/lib/mock-data/types";

const UPCOMING: BoardVoteStatus[] = ["Draft", "Scheduled", "Open for Vote"];
const RECENT: BoardVoteStatus[] = ["Closed", "Finalized", "Tabled"];

export function votesUpcoming(votes: BoardVoteItem[]) {
  return votes.filter((v) => UPCOMING.includes(v.status));
}

export function votesOpen(votes: BoardVoteItem[]) {
  return votes.filter((v) => v.status === "Open for Vote");
}

export function votesRecentDecisions(votes: BoardVoteItem[]) {
  return votes.filter((v) => RECENT.includes(v.status));
}

export function votesNeedFollowUp(votes: BoardVoteItem[]) {
  return votes.filter((v) => v.followUpRequired || v.status === "Needs Follow-Up");
}

export function votesDecisionsDueSoon(votes: BoardVoteItem[]) {
  return votes.filter(
    (v) => v.status === "Scheduled" || v.status === "Open for Vote" || v.status === "Needs Follow-Up",
  );
}

export type VotingSummaryStats = {
  upcoming: number;
  open: number;
  dueSoon: number;
  followUp: number;
};

export function votingSummaryStats(votes: BoardVoteItem[]): VotingSummaryStats {
  const upcoming = votes.filter((v) => v.status === "Draft" || v.status === "Scheduled").length;
  const open = votesOpen(votes).length;
  const followUp = votesNeedFollowUp(votes).length;
  const dueSoon = votesDecisionsDueSoon(votes).length;
  return { upcoming, open, dueSoon, followUp };
}

export function overviewVotingSummaryLine(votes: BoardVoteItem[]): string {
  const openingSoon = votes.filter((v) => v.status === "Scheduled").length;
  const open = votesOpen(votes).length;
  const followUp = votesNeedFollowUp(votes).length;
  const parts: string[] = [];
  if (openingSoon) parts.push(`${openingSoon} vote${openingSoon === 1 ? "" : "s"} opening soon`);
  if (open) parts.push(`${open} open for vote`);
  parts.push("decisions on the calendar");
  if (followUp) {
    parts.push(`${followUp} item${followUp === 1 ? "" : "s"} need${followUp === 1 ? "s" : ""} follow-up`);
  }
  return parts.join(" · ");
}
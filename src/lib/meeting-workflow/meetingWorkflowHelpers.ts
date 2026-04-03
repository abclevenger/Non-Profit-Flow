import type { BoardMeeting, BoardVoteItem } from "@/lib/mock-data/types";

export const WORKFLOW_TODAY = new Date("2026-04-02T12:00:00");

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntilMeeting(dateKey: string, from: Date = WORKFLOW_TODAY): number {
  const t = parseDateKey(dateKey);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diff = t.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function upcomingMeetings(meetings: BoardMeeting[]): BoardMeeting[] {
  return meetings
    .filter((m) => m.status === "Scheduled" || m.status === "In Progress")
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function pastMeetings(meetings: BoardMeeting[]): BoardMeeting[] {
  return meetings
    .filter((m) => m.status === "Completed")
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function nextBoardMeeting(meetings: BoardMeeting[]): BoardMeeting | null {
  const up = upcomingMeetings(meetings);
  return up[0] ?? null;
}

export function decisionsRequiredCount(meeting: BoardMeeting): number {
  return meeting.agendaItems.filter((a) => !a.informational && a.linkedVoteId).length;
}

export function pendingDecisionsCount(meeting: BoardMeeting, votes: BoardVoteItem[]): number {
  const ids = new Set(meeting.voteItems);
  return votes.filter((v) => {
    if (!ids.has(v.id)) return false;
    const open =
      v.status === "Draft" ||
      v.status === "Scheduled" ||
      v.status === "Open for Vote" ||
      v.status === "Needs Follow-Up";
    return open;
  }).length;
}

export function votesForMeeting(meeting: BoardMeeting, votes: BoardVoteItem[]): BoardVoteItem[] {
  const set = new Set(meeting.voteItems);
  return votes.filter((v) => set.has(v.id));
}

export function actionsForMeeting<T extends { id: string }>(meeting: BoardMeeting, actions: T[]): T[] {
  const set = new Set(meeting.actionItems);
  return actions.filter((a) => set.has(a.id));
}

export function nextMeetingOverviewLine(meeting: BoardMeeting | null, votes: BoardVoteItem[]): string {
  if (!meeting) return "No upcoming meeting scheduled.";
  const days = daysUntilMeeting(meeting.dateKey);
  const pending = pendingDecisionsCount(meeting, votes);
  const dayPart =
    days < 0
      ? "Meeting date passed — confirm status"
      : days === 0
        ? "Meeting is today"
        : days === 1
          ? "Next meeting in 1 day"
          : `Next meeting in ${days} days`;
  const decPart = pending === 0 ? "no decisions pending" : `${pending} decision${pending === 1 ? "" : "s"} pending`;
  return `${dayPart} · ${decPart}`;
}

export function meetingsOnDateKey(meetings: BoardMeeting[], dateKey: string): BoardMeeting[] {
  return meetings.filter((m) => m.dateKey === dateKey);
}

export function calendarMonthKeys(year: number, month0: number): { dateKey: string; label: string }[] {
  const last = new Date(year, month0 + 1, 0);
  const out: { dateKey: string; label: string }[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    const y = year;
    const m = String(month0 + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    out.push({
      dateKey: `${y}-${m}-${day}`,
      label: String(d),
    });
  }
  return out;
}

import type { MeetingMinutesRecord, MinutesRecordStatus } from "@/lib/mock-data/types";

export type MinutesSummaryStats = {
  draft: number;
  inReview: number;
  approved: number;
  meetingsWithOpenFollowUp: number;
};

function isOpenFollowUp(status: string): boolean {
  const s = status.toLowerCase();
  return s === "open" || s === "in progress" || s === "not started";
}

export function minutesSummaryStats(records: MeetingMinutesRecord[]): MinutesSummaryStats {
  const draft = records.filter((r) => r.status === "Draft").length;
  const inReview = records.filter((r) => r.status === "In Review").length;
  const approved = records.filter((r) => r.status === "Approved" || r.status === "Published").length;
  const meetingsWithOpenFollowUp = records.filter((r) =>
    r.followUpActions.some((a) => isOpenFollowUp(a.status)),
  ).length;
  return { draft, inReview, approved, meetingsWithOpenFollowUp };
}

export function minutesByStatus(records: MeetingMinutesRecord[], statuses: MinutesRecordStatus[]): MeetingMinutesRecord[] {
  return records.filter((r) => statuses.includes(r.status));
}

export function minutesPublicRecords(records: MeetingMinutesRecord[]): MeetingMinutesRecord[] {
  return records.filter((r) => r.publicVisible);
}

/** Parse loose dates like "Mar 4, 2026" for sort; future: filter by date range in UI */
export function minutesSortByDateDesc(records: MeetingMinutesRecord[]): MeetingMinutesRecord[] {
  return [...records].sort((a, b) => {
    const ta = Date.parse(a.meetingDate);
    const tb = Date.parse(b.meetingDate);
    if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
    return b.meetingDate.localeCompare(a.meetingDate);
  });
}

export function minutesRecent(records: MeetingMinutesRecord[], n: number): MeetingMinutesRecord[] {
  return minutesSortByDateDesc(records).slice(0, n);
}

export function openFollowUpCount(records: MeetingMinutesRecord[]): number {
  return records.reduce(
    (acc, r) => acc + r.followUpActions.filter((a) => isOpenFollowUp(a.status)).length,
    0,
  );
}

export function overviewMinutesSummaryLine(records: MeetingMinutesRecord[]): string {
  const pipeline = records.filter((r) => r.status === "Draft" || r.status === "In Review").length;
  const approved = records.filter((r) => r.status === "Approved" || r.status === "Published").length;
  const open = openFollowUpCount(records);
  const pipeLabel =
    pipeline === 0
      ? "No drafts in review"
      : pipeline === 1
        ? "1 draft or in review"
        : `${pipeline} drafts or in review`;
  return `${pipeLabel} · ${approved} approved records · ${open} follow-up items open`;
}

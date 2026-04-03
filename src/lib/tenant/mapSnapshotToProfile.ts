import type { OrganizationProfile } from "@/lib/mock-data/types";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import type { SampleProfileId } from "@/lib/mock-data/types";
import type { TenantSnapshot } from "./fetchTenantSnapshot";

function coerceProfileId(key: string | null | undefined): SampleProfileId {
  if (key === "growingNonprofit" || key === "privateSchool" || key === "communityNonprofit") return key;
  return "communityNonprofit";
}

type OrgBranding = {
  name: string;
  missionSnippet: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  demoProfileKey: string | null;
};

/**
 * Merges Prisma org branding + Supabase tenant rows into `OrganizationProfile`.
 * Falls back to bundled mock slices when tables are empty (safe rollout).
 */
export function mapSnapshotToOrganizationProfile(
  snapshot: TenantSnapshot,
  branding: OrgBranding,
): OrganizationProfile {
  const fallback = getDashboardProfile(coerceProfileId(branding.demoProfileKey));
  const o = snapshot.overlay;

  const strategicPriorities =
    snapshot.strategicPriorities.length > 0
      ? snapshot.strategicPriorities.map((row, idx) => ({
          id: String((row as { id?: string }).id ?? `priority-${idx}`),
          title: String((row as { title: string }).title),
          description: String((row as { description?: string }).description ?? ""),
          owner: String((row as { owner?: string }).owner ?? ""),
          progress: Number((row as { progress?: number }).progress ?? 0),
          status: (row as { status: string }).status as OrganizationProfile["strategicPriorities"][0]["status"],
          nextMilestone: String((row as { next_milestone?: string }).next_milestone ?? ""),
          dueDate: String((row as { due_date?: string }).due_date ?? ""),
          lastUpdated: String((row as { last_updated?: string }).last_updated ?? ""),
          notes: String((row as { notes?: string }).notes ?? ""),
          category: (row as { category?: string }).category,
        }))
      : fallback.strategicPriorities;

  const risks =
    snapshot.risks.length > 0
      ? snapshot.risks.map((row) => ({
          category: String((row as { category: string }).category),
          status: (row as { status: string }).status as OrganizationProfile["risks"][0]["status"],
          summary: String((row as { summary: string }).summary),
          owner: (row as { owner?: string }).owner,
          watchlist: Boolean((row as { watchlist?: boolean }).watchlist),
          trend: (row as { trend?: string }).trend as OrganizationProfile["risks"][0]["trend"],
        }))
      : fallback.risks;

  const governance =
    snapshot.governance.length > 0
      ? snapshot.governance.map((row) => ({
          label: String((row as { label: string }).label),
          status: String((row as { status: string }).status),
          detail: (row as { detail?: string }).detail,
        }))
      : fallback.governance;

  const actionItems =
    snapshot.actions.length > 0
      ? snapshot.actions.map((row) => ({
          id: String((row as { id: string }).id),
          task: String((row as { task: string }).task),
          owner: String((row as { owner: string }).owner),
          dueDate: String((row as { due_date: string }).due_date),
          status: String((row as { status: string }).status),
          overdue: Boolean((row as { overdue?: boolean }).overdue),
          linkedMeetingId: (row as { linked_meeting_id?: string }).linked_meeting_id,
          linkedVoteId: (row as { linked_vote_id?: string }).linked_vote_id,
        }))
      : fallback.actionItems;

  const documents =
    snapshot.documents.length > 0
      ? snapshot.documents.map((row) => ({
          title: String((row as { title: string }).title),
          type: String((row as { type: string }).type),
          lastUpdated: String((row as { last_updated: string }).last_updated),
          href: String((row as { href: string }).href),
          category: (row as { category: string }).category as OrganizationProfile["documents"][0]["category"],
          downloadAllowed: (row as { download_allowed?: boolean }).download_allowed,
        }))
      : fallback.documents;

  const keyMetrics =
    snapshot.keyMetrics.length > 0
      ? snapshot.keyMetrics.map((row) => ({
          label: String((row as { label: string }).label),
          value: String((row as { value: string }).value),
          sublabel: (row as { sublabel?: string }).sublabel,
          trend: (row as { trend?: string }).trend as OrganizationProfile["keyMetrics"][0]["trend"],
          tone: (row as { tone?: string }).tone as OrganizationProfile["keyMetrics"][0]["tone"],
        }))
      : fallback.keyMetrics;

  const complianceCalendar =
    snapshot.compliance.length > 0
      ? snapshot.compliance.map((row) => ({
          label: String((row as { label: string }).label),
          date: String((row as { event_date: string }).event_date),
          status: String((row as { status: string }).status),
        }))
      : fallback.complianceCalendar;

  const boardMeetings =
    snapshot.boardMeetings.length > 0
      ? snapshot.boardMeetings
          .map((r) => r.payload as OrganizationProfile["boardMeetings"][0])
          .filter(Boolean)
      : fallback.boardMeetings;

  const boardVotes =
    snapshot.votes.length > 0
      ? snapshot.votes.map((r) => r.payload as OrganizationProfile["boardVotes"][0]).filter(Boolean)
      : fallback.boardVotes;

  const meetingMinutes =
    snapshot.minutes.length > 0
      ? snapshot.minutes.map((r) => r.payload as OrganizationProfile["meetingMinutes"][0]).filter(Boolean)
      : fallback.meetingMinutes;

  const executiveUpdate =
    o?.executive_update && typeof o.executive_update === "object"
      ? (o.executive_update as OrganizationProfile["executiveUpdate"])
      : fallback.executiveUpdate;

  const boardAgenda =
    o?.board_agenda && typeof o.board_agenda === "object"
      ? (o.board_agenda as OrganizationProfile["boardAgenda"])
      : fallback.boardAgenda;

  const boardTraining =
    o?.board_training && typeof o.board_training === "object"
      ? (o.board_training as OrganizationProfile["boardTraining"])
      : fallback.boardTraining;

  const theme = fallback.theme;
  theme.accent = branding.primaryColor || theme.accent;
  theme.sidebarBg = branding.secondaryColor || theme.sidebarBg;

  return {
    organizationName: branding.name,
    missionSnippet: branding.missionSnippet ?? fallback.missionSnippet,
    logo: branding.logoUrl
      ? { type: "url" as const, src: branding.logoUrl, alt: branding.name }
      : fallback.logo,
    reportingPeriod: o?.reporting_period ?? fallback.reportingPeriod,
    boardChair: o?.board_chair ?? fallback.boardChair,
    executiveDirector: o?.executive_director ?? fallback.executiveDirector,
    theme,
    strategicPriorities,
    boardAgenda,
    keyMetrics,
    risks,
    executiveUpdate,
    actionItems,
    governance,
    documents,
    boardVotes,
    boardTraining,
    meetingMinutes,
    boardMeetings,
    meetingPrepNotes: o?.meeting_prep_notes ?? fallback.meetingPrepNotes,
    governanceNotes: o?.governance_notes ?? fallback.governanceNotes,
    strategicAlignmentNotes: o?.strategic_alignment_notes ?? fallback.strategicAlignmentNotes,
    complianceCalendar,
  };
}

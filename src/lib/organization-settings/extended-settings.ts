/**
 * Persisted on `OrganizationSettings.extendedSettings` (Prisma Json).
 * Keep additive: unknown keys are preserved when merging PATCH payloads.
 */
export type BoardSeat = { title: string; name?: string; termEnds?: string };

export type CommitteeStub = { id: string; name: string; chair?: string; meetingCadence?: string };

export type OrganizationExtendedSettings = {
  boardStructure?: {
    seats?: BoardSeat[];
    meetingCadenceDefault?: string;
    quorumNotes?: string;
  };
  committees?: CommitteeStub[];
  compliancePreferences?: {
    filingCalendarReminderDays?: number;
    riskTolerance?: "low" | "medium" | "high";
    notes?: string;
  };
  notificationPreferences?: {
    emailDigest?: boolean;
    meetingReminders?: boolean;
    voteAlerts?: boolean;
  };
  attorneyAdvisorAccess?: {
    externalCounselEmails?: string[];
    matterVisibility?: "full" | "limited";
  };
  meetingDefaults?: {
    defaultDurationMinutes?: number;
    packetLeadTimeDays?: number;
    locationTemplate?: string;
  };
  votingSettings?: {
    quorumPolicy?: string;
    defaultBallotVisibility?: "board_only" | "committee";
  };
  aiReportSettings?: {
    enabled?: boolean;
    tone?: string;
    redactPii?: boolean;
  };
  billing?: {
    planLabel?: string;
    status?: "trial" | "active" | "paused";
    notes?: string;
  };
};

export const defaultExtendedSettings = (): OrganizationExtendedSettings => ({
  boardStructure: {
    seats: [
      { title: "Board chair" },
      { title: "Treasurer" },
      { title: "Secretary" },
    ],
    meetingCadenceDefault: "Monthly board meeting; committees as needed",
  },
  committees: [],
  compliancePreferences: { filingCalendarReminderDays: 30, riskTolerance: "medium" },
  notificationPreferences: { emailDigest: true, meetingReminders: true, voteAlerts: true },
  attorneyAdvisorAccess: { externalCounselEmails: [], matterVisibility: "limited" },
  meetingDefaults: { defaultDurationMinutes: 120, packetLeadTimeDays: 7 },
  votingSettings: { quorumPolicy: "Majority of voting members present", defaultBallotVisibility: "board_only" },
  aiReportSettings: { enabled: true, tone: "professional", redactPii: true },
  billing: { planLabel: "Starter", status: "trial" },
});

export function parseExtendedSettings(raw: unknown): OrganizationExtendedSettings {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as OrganizationExtendedSettings;
  }
  return {};
}

export function mergeExtendedSettings(
  current: OrganizationExtendedSettings,
  patch: Partial<OrganizationExtendedSettings>,
): OrganizationExtendedSettings {
  return {
    ...current,
    ...patch,
    boardStructure: patch.boardStructure
      ? { ...current.boardStructure, ...patch.boardStructure }
      : current.boardStructure,
    compliancePreferences: patch.compliancePreferences
      ? { ...current.compliancePreferences, ...patch.compliancePreferences }
      : current.compliancePreferences,
    notificationPreferences: patch.notificationPreferences
      ? { ...current.notificationPreferences, ...patch.notificationPreferences }
      : current.notificationPreferences,
    attorneyAdvisorAccess: patch.attorneyAdvisorAccess
      ? { ...current.attorneyAdvisorAccess, ...patch.attorneyAdvisorAccess }
      : current.attorneyAdvisorAccess,
    meetingDefaults: patch.meetingDefaults
      ? { ...current.meetingDefaults, ...patch.meetingDefaults }
      : current.meetingDefaults,
    votingSettings: patch.votingSettings
      ? { ...current.votingSettings, ...patch.votingSettings }
      : current.votingSettings,
    aiReportSettings: patch.aiReportSettings
      ? { ...current.aiReportSettings, ...patch.aiReportSettings }
      : current.aiReportSettings,
    billing: patch.billing ? { ...current.billing, ...patch.billing } : current.billing,
    committees: patch.committees ?? current.committees,
  };
}

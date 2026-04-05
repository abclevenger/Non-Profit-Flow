export type AgencyHealthTier = "healthy" | "at_risk" | "critical";

export type AgencyAccountRow = {
  organizationId: string;
  name: string;
  slug: string;
  isDemoTenant: boolean;
  onboardingStatus: string;
  memberCount: number;
  latestAssessmentId: string | null;
  latestAssessmentStatus: string | null;
  latestAssessmentUpdatedAt: Date | null;
  /** 0–100 from latest completed run; null if none. */
  healthScore: number | null;
  healthTier: AgencyHealthTier;
  consultNeeded: boolean;
  openConsultCount: number;
  assignedAdvisorLabel: string | null;
  lastUpdatedAt: Date;
};

export type AgencyActivityType =
  | "assessment_submitted"
  | "assessment_progress"
  | "consult_flagged"
  | "gc_review"
  | "expert_review"
  | "content_access";

export type AgencyActivityItem = {
  id: string;
  type: AgencyActivityType;
  title: string;
  detail: string | null;
  organizationId: string;
  organizationName: string;
  occurredAt: Date;
  href: string | null;
};

export type AgencyConsultRow = {
  id: string;
  source: "assessment_flag" | "gc_review";
  organizationId: string;
  organizationName: string;
  category: string;
  summary: string;
  severity: string;
  ratingType: string | null;
  status: string;
  flaggedAt: Date;
  itemHref: string | null;
};

/** Full consult pipeline row for agency consult page (DB-backed). */
export type AgencyConsultPipelineRow = {
  id: string;
  source: "assessment_flag" | "gc_review" | "expert_review";
  organizationId: string;
  organizationName: string;
  /** Section / indicator / item type label */
  categoryLabel: string;
  issueText: string;
  /** Raw severity label (GC urgency or derived). */
  severity: string;
  /** P1 / P2 / P3 style */
  priorityLevel: "P1" | "P2" | "P3";
  ratingType: string | null;
  ratingTypeLabel: string | null;
  assignedAdvisorLabel: string | null;
  pipelineStatus: "new" | "in_review" | "scheduled" | "resolved";
  createdAt: Date;
  updatedAt: Date;
  itemHref: string | null;
};

export type AgencyTeamMemberRow = {
  userId: string;
  name: string | null;
  /** From `UserProfile.fullName` when set */
  fullName: string | null;
  email: string;
  agencyRole: "OWNER" | "AGENCY_ADMIN" | "AGENCY_STAFF";
  status: string;
  nonprofits: { id: string; name: string }[];
  lastActiveAt: Date | null;
};

export type AgencyNonprofitAccountDetail = {
  organization: {
    id: string;
    name: string;
    slug: string;
    missionSnippet: string | null;
    isDemoTenant: boolean;
    onboardingStatus: string;
    industryType: string | null;
  };
  latestAssessment: {
    id: string;
    status: string;
    title: string;
    updatedAt: Date;
    submittedAt: Date | null;
  } | null;
  boardHealth: {
    score: number | null;
    tier: AgencyHealthTier;
    essentialConsultFlags: number;
    openConsultCount: number;
  };
  assignedAdvisorLabel: string | null;
  nextMeeting: null;
  recentActivity: AgencyActivityItem[];
  quickLinks: {
    latestAssessmentId: string | null;
    hasSubmittedReport: boolean;
  };
};

export type AgencyOverviewStats = {
  nonprofitCount: number;
  activeTeamMembersAcrossOrgs: number;
  agencyTeamCount: number;
  openConsultFlags: number;
  completedAssessmentsCount: number;
  accountsNeedingReview: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  essentialFlagsCount: number;
};

export type AgencyReportsRollup = {
  avgHealthScore: number | null;
  assessmentCompletionRate: number;
  consultByCategory: { category: string; count: number }[];
  criticalOrgCount: number;
  totalFlaggedResponses: number;
};

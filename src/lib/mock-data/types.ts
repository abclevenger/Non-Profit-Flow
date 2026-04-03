/**
 * Central type definitions for the Board Oversight Dashboard demo.
 * When adding a new nonprofit preview, mirror this shape in a new profile file
 * and wire it up in dashboardData.ts.
 */

export type SampleProfileId = "communityNonprofit" | "growingNonprofit" | "privateSchool";

/** @deprecated Use SampleProfileId — kept as alias for existing imports */
export type DemoMode = SampleProfileId;

export type RiskLevel = "Low" | "Medium" | "High";

export type AgendaItemKind = "decision" | "discussion" | "approval" | "general";

export interface OrganizationTheme {
  accent: string;
  accentForeground: string;
  sidebarBg: string;
  border: string;
}

export interface OrganizationProfile {
  organizationName: string;
  missionSnippet: string;
  logo: {
    type: "placeholder" | "url";
    src?: string;
    alt: string;
  };
  reportingPeriod: string;
  boardChair: string;
  executiveDirector: string;
  theme: OrganizationTheme;
  strategicPriorities: StrategicPriority[];
  boardAgenda: BoardAgenda;
  keyMetrics: KeyMetric[];
  risks: RiskItem[];
  executiveUpdate: ExecutiveUpdate;
  actionItems: ActionItem[];
  governance: GovernanceItem[];
  documents: DocumentItem[];
  /**
   * Board Voting & Decision Workflow — see lib/mock-data/votes/*.ts
   */
  boardVotes: BoardVoteItem[];
  /**
   * Board Member Training / orientation — see lib/mock-data/training/*.ts
   * Future: per-user completion, coordinator assignment, acknowledgements, video.
   */
  boardTraining: BoardTrainingBundle;
  /**
   * Meeting minutes & official records — see lib/mock-data/minutes/*.ts
   * Future: export, publishing workflow, search, link to live votes/actions.
   */
  meetingMinutes: MeetingMinutesRecord[];
  /**
   * Unified meeting workflow — calendar, agenda, votes, minutes, actions.
   * See lib/mock-data/board-meetings/*.ts
   */
  boardMeetings: BoardMeeting[];
  meetingPrepNotes?: string;
  governanceNotes?: string;
  strategicAlignmentNotes?: string;
  complianceCalendar?: { label: string; date: string; status: string }[];
}

/** Board-facing strategic planning status â€” drives StatusPill colors app-wide. */
export type StrategicPriorityStatus = "On Track" | "At Risk" | "Off Track";

/**
 * Strategic priority â€” Strategic Planning module + overview summary.
 * Future: editing, updates, agenda links, export (keep id stable).
 */
export interface StrategicPriority {
  id: string;
  title: string;
  description: string;
  owner: string;
  progress: number;
  status: StrategicPriorityStatus;
  nextMilestone: string;
  dueDate: string;
  lastUpdated: string;
  notes: string;
  category?: string;
  alignmentNote?: string;
  /** @deprecated Prefer description */
  summary?: string;
}



/** Vote lifecycle for Board Voting & Decision Workflow */
export type BoardVoteStatus =
  | "Draft"
  | "Scheduled"
  | "Open for Vote"
  | "Closed"
  | "Finalized"
  | "Tabled"
  | "Needs Follow-Up";

export type DiscussionCommentType = "Question" | "Discussion";

export interface DiscussionComment {
  id: string;
  author: string;
  type: DiscussionCommentType;
  message: string;
  createdAt: string;
}

export interface BoardVoteItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  fullMotionText?: string;
  status: BoardVoteStatus;
  opensAt: string;
  closesAt: string;
  decisionDate: string;
  meetingDate?: string;
  movedBy?: string;
  secondedBy?: string;
  outcome?: string;
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  owner: string;
  publicVisible: boolean;
  followUpRequired: boolean;
  linkedAgendaItem?: string;
  linkedDocument?: string;
  notes?: string;
  /** Workflow: ties vote to a BoardMeeting.id */
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
  discussionThread: DiscussionComment[];
  finalizedAt?: string;
}

export interface BoardAgendaItem {
  title: string;
  kind: AgendaItemKind;
}

export interface BoardAgenda {
  nextMeetingDate: string;
  meetingLabel?: string;
  items: BoardAgendaItem[];
}

export interface KeyMetric {
  label: string;
  value: string;
  sublabel?: string;
  trend?: "up" | "down" | "flat";
  tone?: "default" | "positive" | "neutral" | "attention";
}

export interface RiskItem {
  category: string;
  status: RiskLevel;
  summary: string;
  owner?: string;
  watchlist?: boolean;
  trend?: "stable" | "rising" | "improving";
}

export interface ExecutiveUpdate {
  wins: string[];
  blockers: string[];
  boardNotes: string[];
  changesSinceLastMeeting: string[];
  priorityIssues?: string[];
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  status: string;
  overdue: boolean;
  linkedMeetingId?: string;
  linkedVoteId?: string;
}

export interface GovernanceItem {
  label: string;
  status: string;
  detail?: string;
}

export interface DocumentItem {
  title: string;
  type: string;
  lastUpdated: string;
  href: string;
  category: "packet" | "minutes" | "resolution" | "approval" | "other";
}

/** Module completion for orientation — drives CompletionStatusPill */
export type TrainingModuleCompletionStatus = "Not Started" | "In Progress" | "Complete";

/**
 * Single orientation module. Set `required: false` for optional paths.
 * `linkedResources` references TrainingResource.id values in the same bundle.
 */
export interface TrainingModuleItem {
  id: string;
  title: string;
  summary: string;
  required: boolean;
  estimatedTime: string;
  status: TrainingModuleCompletionStatus;
  category: string;
  /** Short plain-language body shown on the training page */
  content: string[];
  linkedResources: string[];
}

export type TrainingResourceKind =
  | "handbook"
  | "bylaws"
  | "policy"
  | "plan"
  | "packet"
  | "orientation"
  | "other";

export interface TrainingResource {
  id: string;
  title: string;
  type: TrainingResourceKind;
  description: string;
  lastUpdated: string;
  href?: string;
  /** Highlight as coordinator-recommended reading */
  recommended?: boolean;
}

/**
 * Aggregate progress (demo: one org-level snapshot).
 * Future: replace with per-board-member records keyed by user id.
 */
export interface TrainingProgress {
  percentComplete: number;
  completedCount: number;
  remainingCount: number;
  lastViewedDate: string;
  documentsReviewed: number;
  documentsTotal: number;
}

export interface OrientationTimelineStep {
  id: string;
  weekLabel: string;
  title: string;
  summary: string;
}

export interface GovernanceBasicsPoint {
  id: string;
  heading: string;
  body: string;
}

export interface TrainingQuickAnswer {
  id: string;
  question: string;
  answer: string;
}

/** Everything the Training page needs; tailor per nonprofit profile */
export interface BoardTrainingBundle {
  modules: TrainingModuleItem[];
  resources: TrainingResource[];
  progress: TrainingProgress;
  orientationTimeline: OrientationTimelineStep[];
  governanceBasics: GovernanceBasicsPoint[];
  quickAnswers: TrainingQuickAnswer[];
  welcomeTitle: string;
  welcomeLead: string;
  missionSnapshot: string;
}

/** Minutes lifecycle — drives MinutesStatusPill */
export type MinutesRecordStatus = "Draft" | "In Review" | "Approved" | "Published";

export type MeetingMinutesType = "Regular" | "Special" | "Committee" | "Public";

/** Follow-up tied to a minutes record; future: sync ids with actionItems */
export interface MinutesFollowUpAction {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  status: string;
}

/** Decision line extracted from minutes; optional link to voting module */
export interface MinutesDecisionItem {
  id: string;
  title: string;
  summary: string;
  outcome: string;
  linkedVoteId?: string;
}

/**
 * One meeting's official record. Set status to Approved when board adopts minutes;
 * set publicVisible + publishedDate when a public summary is posted.
 */
export interface MeetingMinutesRecord {
  id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingType: MeetingMinutesType;
  status: MinutesRecordStatus;
  summary: string;
  /** Optional shorter text for website / public posting */
  publicSummary?: string;
  attendees: string[];
  discussionNotes: string;
  decisionsMade: MinutesDecisionItem[];
  linkedVotes: string[];
  linkedAgendaItems: string[];
  followUpActions: MinutesFollowUpAction[];
  preparedBy: string;
  approvedDate?: string;
  publishedDate?: string;
  publicVisible: boolean;
  linkedDocuments: { id: string; title: string; href?: string }[];
  createdAt: string;
  updatedAt: string;
  draftCreatedAt?: string;
  sentForReviewAt?: string;
  /** Workflow: ties minutes to BoardMeeting.id */
  meetingId?: string;
}

/** Meeting lifecycle for workflow / calendar */
export type BoardMeetingStatus = "Scheduled" | "In Progress" | "Completed";

/** Meeting kind for workflow */
export type BoardMeetingType = "Board" | "Committee" | "Special" | "Public";

/** Agenda row on a scheduled BoardMeeting */
export interface WorkflowAgendaItem {
  id: string;
  title: string;
  informational: boolean;
  linkedVoteId?: string;
}

/**
 * Canonical meeting entity connecting agenda, votes, minutes, and follow-ups.
 */
export interface BoardMeeting {
  id: string;
  title: string;
  meetingDate: string;
  dateKey: string;
  meetingType: BoardMeetingType;
  status: BoardMeetingStatus;
  agendaItems: WorkflowAgendaItem[];
  voteItems: string[];
  minutesRecordId?: string | null;
  actionItems: string[];
  publicVisible: boolean;
  preMeetingDiscussionVoteIds?: string[];
}


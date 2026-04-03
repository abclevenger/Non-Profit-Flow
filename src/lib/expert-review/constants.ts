/** User-facing copy — exact strings for product UI. */

export const EXPERT_REVIEW_ACTION_LABEL = "Request Review";

export const EXPERT_REVIEW_MODAL_TITLE = "Request Review";

export const EXPERT_REVIEW_SUCCESS_MESSAGE =
  "Your request was submitted and routed to the configured contact.";

export const EXPERT_REVIEW_NO_ROUTE_ERROR = "No routing email configured for this request category.";

export const ISSUE_ROUTING_SETTINGS_TITLE = "Issue Routing Settings";

export const REVIEW_REQUESTS_QUEUE_TITLE = "Review Requests";

export const EXPERT_REVIEW_CATEGORY_KEYS = [
  "GENERAL_COUNSEL",
  "COMPLIANCE",
  "FUNDRAISING",
  "RECRUITING",
  "TRAINING",
  "OPERATIONS_PROCESS",
  "OTHER",
] as const;

export type ExpertReviewCategoryKey = (typeof EXPERT_REVIEW_CATEGORY_KEYS)[number];

export const EXPERT_REVIEW_CATEGORY_LABEL: Record<ExpertReviewCategoryKey, string> = {
  GENERAL_COUNSEL: "General Counsel",
  COMPLIANCE: "Compliance",
  FUNDRAISING: "Fundraising",
  RECRUITING: "Recruiting",
  TRAINING: "Training",
  OPERATIONS_PROCESS: "Operations / Process",
  OTHER: "Other",
};

export const EXPERT_PRIORITY_KEYS = ["STANDARD", "TIME_SENSITIVE", "URGENT"] as const;
export type ExpertPriorityKey = (typeof EXPERT_PRIORITY_KEYS)[number];

export const EXPERT_PRIORITY_LABEL: Record<ExpertPriorityKey, string> = {
  STANDARD: "Standard",
  TIME_SENSITIVE: "Time Sensitive",
  URGENT: "Urgent",
};

export const EXPERT_STATUS_KEYS = [
  "SUBMITTED",
  "ROUTED",
  "EMAIL_SENT",
  "IN_PROGRESS",
  "COMPLETED",
  "NEEDS_MORE_INFO",
  "FAILED_DELIVERY",
] as const;

export type ExpertStatusKey = (typeof EXPERT_STATUS_KEYS)[number];

export const EXPERT_STATUS_LABEL: Record<ExpertStatusKey, string> = {
  SUBMITTED: "Submitted",
  ROUTED: "Routed",
  EMAIL_SENT: "Email Sent",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  NEEDS_MORE_INFO: "Needs More Info",
  FAILED_DELIVERY: "Failed Delivery",
};

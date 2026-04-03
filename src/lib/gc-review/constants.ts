/** User-facing copy — use these strings in UI. */

export const GC_FLAG_ACTION_LABEL = "Flag for General Counsel Review";

export const GC_MODAL_TITLE = "Flag for General Counsel Review";

export const GC_QUEUE_HEADING = "General Counsel Review Queue";

export const GC_STATUS_LABEL = {
  PENDING: "Pending General Counsel Review",
  UNDER_REVIEW: "Under GC Review",
  COMPLETE: "GC Review Complete",
  ESCALATED: "Escalated",
  NEEDS_INFO: "Needs More Information",
} as const;

export type GcStatusKey = keyof typeof GC_STATUS_LABEL;

export const GC_URGENCY_LABEL = {
  STANDARD: "Standard",
  TIME_SENSITIVE: "Time Sensitive",
  HIGH_RISK: "High Risk",
} as const;

export type GcUrgencyKey = keyof typeof GC_URGENCY_LABEL;

export const GC_ITEM_TYPES = [
  "vote",
  "agenda",
  "procurement",
  "compliance",
  "policy",
  "follow_up",
  "board_decision",
  "contract",
] as const;

export type GcItemType = (typeof GC_ITEM_TYPES)[number];

export const GC_ITEM_TYPE_LABEL: Record<GcItemType, string> = {
  vote: "Vote item",
  agenda: "Agenda item",
  procurement: "Procurement",
  compliance: "Compliance",
  policy: "Policy update",
  follow_up: "Meeting follow-up",
  board_decision: "Board decision",
  contract: "Contract record",
};

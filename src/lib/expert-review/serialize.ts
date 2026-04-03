import type { ExpertReviewRequest, IssueRoutingRule } from "@prisma/client";
import {
  EXPERT_REVIEW_CATEGORY_KEYS,
  EXPERT_REVIEW_CATEGORY_LABEL,
  type ExpertReviewCategoryKey,
  EXPERT_PRIORITY_KEYS,
  EXPERT_PRIORITY_LABEL,
  type ExpertPriorityKey,
  EXPERT_STATUS_KEYS,
  EXPERT_STATUS_LABEL,
  type ExpertStatusKey,
} from "@/lib/expert-review/constants";

function catKey(s: string): ExpertReviewCategoryKey {
  return (EXPERT_REVIEW_CATEGORY_KEYS as readonly string[]).includes(s)
    ? (s as ExpertReviewCategoryKey)
    : "OTHER";
}

function priKey(s: string): ExpertPriorityKey {
  return (EXPERT_PRIORITY_KEYS as readonly string[]).includes(s) ? (s as ExpertPriorityKey) : "STANDARD";
}

function stKey(s: string): ExpertStatusKey {
  return (EXPERT_STATUS_KEYS as readonly string[]).includes(s) ? (s as ExpertStatusKey) : "SUBMITTED";
}

export type ExpertReviewPublicJson = {
  id: string;
  organizationId: string;
  category: ExpertReviewCategoryKey;
  categoryLabel: string;
  subject: string;
  summary: string;
  priority: ExpertPriorityKey;
  priorityLabel: string;
  deadline: string | null;
  additionalNotes: string | null;
  createdByName: string | null;
  createdAt: string;
  relatedItemType: string;
  relatedItemId: string;
  relatedItemTitle: string | null;
  relatedHref: string | null;
  destinationEmail: string;
  status: ExpertStatusKey;
  statusLabel: string;
  emailSentAt: string | null;
};

export function toExpertReviewPublicJson(row: ExpertReviewRequest): ExpertReviewPublicJson {
  const ck = catKey(row.category);
  const pk = priKey(row.priority);
  const sk = stKey(row.status);
  return {
    id: row.id,
    organizationId: row.organizationId,
    category: ck,
    categoryLabel: EXPERT_REVIEW_CATEGORY_LABEL[ck],
    subject: row.subject,
    summary: row.summary,
    priority: pk,
    priorityLabel: EXPERT_PRIORITY_LABEL[pk],
    deadline: row.deadline ? row.deadline.toISOString() : null,
    additionalNotes: row.additionalNotes,
    createdByName: row.createdByName,
    createdAt: row.createdAt.toISOString(),
    relatedItemType: row.relatedItemType,
    relatedItemId: row.relatedItemId,
    relatedItemTitle: row.relatedItemTitle,
    relatedHref: row.relatedHref,
    destinationEmail: row.destinationEmail,
    status: sk,
    statusLabel: EXPERT_STATUS_LABEL[sk],
    emailSentAt: row.emailSentAt ? row.emailSentAt.toISOString() : null,
  };
}

export type IssueRoutingRuleJson = {
  id: string;
  organizationId: string;
  category: ExpertReviewCategoryKey;
  displayName: string;
  destinationEmail: string;
  isActive: boolean;
  fallbackEmail: string | null;
  notes: string | null;
  updatedAt: string;
};

export function toRoutingRuleJson(row: IssueRoutingRule): IssueRoutingRuleJson {
  const ck = catKey(row.category);
  return {
    id: row.id,
    organizationId: row.organizationId,
    category: ck,
    displayName: row.displayName,
    destinationEmail: row.destinationEmail,
    isActive: row.isActive,
    fallbackEmail: row.fallbackEmail,
    notes: row.notes,
    updatedAt: row.updatedAt.toISOString(),
  };
}

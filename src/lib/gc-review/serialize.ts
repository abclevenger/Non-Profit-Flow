import type { GcReviewRequest } from "@prisma/client";
import {
  GC_ITEM_TYPES,
  type GcItemType,
  GC_ITEM_TYPE_LABEL,
  GC_STATUS_LABEL,
  type GcStatusKey,
  GC_URGENCY_LABEL,
  type GcUrgencyKey,
} from "@/lib/gc-review/constants";

export function isGcItemType(s: string): s is GcItemType {
  return (GC_ITEM_TYPES as readonly string[]).includes(s);
}

export function isGcStatusKey(s: string): s is GcStatusKey {
  return s in GC_STATUS_LABEL;
}

export function isGcUrgencyKey(s: string): s is GcUrgencyKey {
  return s in GC_URGENCY_LABEL;
}

export type GcReviewPublicJson = {
  id: string;
  organizationId: string;
  itemType: GcItemType;
  itemTypeLabel: string;
  itemId: string;
  itemTitle: string;
  statusKey: GcStatusKey;
  statusLabel: string;
  urgencyKey: GcUrgencyKey;
  urgencyLabel: string;
  relatedDeadline: string | null;
  flaggedAt: string;
  flaggedByName: string | null;
};

export type GcReviewFullJson = GcReviewPublicJson & {
  reason: string;
  summaryConcern: string;
  supportingNotes: string | null;
  flaggedByEmail: string | null;
  reviewNotes: string | null;
  recommendation: string | null;
  nextStep: string | null;
  reviewCompletedAt: string | null;
};

function statusKeyFromDb(s: string): GcStatusKey {
  if (isGcStatusKey(s)) return s;
  return "PENDING";
}

function urgencyKeyFromDb(s: string): GcUrgencyKey {
  if (isGcUrgencyKey(s)) return s;
  return "STANDARD";
}

export function toPublicJson(row: GcReviewRequest): GcReviewPublicJson {
  const sk = statusKeyFromDb(row.status);
  const uk = urgencyKeyFromDb(row.urgency);
  const it = isGcItemType(row.itemType) ? row.itemType : "vote";
  return {
    id: row.id,
    organizationId: row.organizationId,
    itemType: it,
    itemTypeLabel: GC_ITEM_TYPE_LABEL[it],
    itemId: row.itemId,
    itemTitle: row.itemTitle,
    statusKey: sk,
    statusLabel: GC_STATUS_LABEL[sk],
    urgencyKey: uk,
    urgencyLabel: GC_URGENCY_LABEL[uk],
    relatedDeadline: row.relatedDeadline ? row.relatedDeadline.toISOString() : null,
    flaggedAt: row.flaggedAt.toISOString(),
    flaggedByName: row.flaggedByName,
  };
}

export function toFullJson(row: GcReviewRequest): GcReviewFullJson {
  return {
    ...toPublicJson(row),
    reason: row.reason,
    summaryConcern: row.summaryConcern,
    supportingNotes: row.supportingNotes,
    flaggedByEmail: row.flaggedByEmail,
    reviewNotes: row.reviewNotes,
    recommendation: row.recommendation,
    nextStep: row.nextStep,
    reviewCompletedAt: row.reviewCompletedAt ? row.reviewCompletedAt.toISOString() : null,
  };
}

export function computeQueueSummary(items: GcReviewPublicJson[]) {
  const open = items.filter((i) => i.statusKey !== "COMPLETE");
  const highRiskOpen = open.filter((i) => i.urgencyKey === "HIGH_RISK").length;
  const deadlines = open
    .filter((i) => i.urgencyKey === "HIGH_RISK" || i.urgencyKey === "TIME_SENSITIVE")
    .map((i) => i.relatedDeadline)
    .filter(Boolean) as string[];
  deadlines.sort();
  return {
    pendingCount: open.length,
    highRiskOpenCount: highRiskOpen,
    nextUrgentDeadline: deadlines[0] ?? null,
  };
}

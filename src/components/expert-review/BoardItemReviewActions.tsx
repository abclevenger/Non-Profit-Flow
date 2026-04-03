"use client";

import { GcReviewItemToolbar } from "@/components/gc-review/GcReviewItemToolbar";
import type { GcItemType } from "@/lib/gc-review/constants";
import { RequestReviewToolbar } from "./RequestReviewToolbar";

/**
 * General Counsel flag + Request Review (routed email) on the same dashboard item.
 */
export function BoardItemReviewActions({
  organizationId,
  gcItemType,
  expertItemType,
  itemId,
  itemTitle,
  relatedHref,
  compact,
}: {
  organizationId: string;
  gcItemType: GcItemType;
  expertItemType: string;
  itemId: string;
  itemTitle: string;
  relatedHref?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Board review actions">
      <GcReviewItemToolbar
        organizationId={organizationId}
        itemType={gcItemType}
        itemId={itemId}
        itemTitle={itemTitle}
        compact={compact}
      />
      <RequestReviewToolbar
        relatedItemType={expertItemType}
        relatedItemId={itemId}
        relatedItemTitle={itemTitle}
        relatedHref={relatedHref}
        compact={compact}
      />
    </div>
  );
}

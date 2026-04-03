"use client";

import { useSession } from "@/lib/auth/session-hooks";
import { EXPERT_REVIEW_ACTION_LABEL } from "@/lib/expert-review/constants";
import { canSubmitExpertReview } from "@/lib/expert-review/permissions";
import type { ExpertReviewPublicJson } from "@/lib/expert-review/serialize";
import { ExpertReviewStatusPill } from "./ExpertReviewStatusPill";
import { useExpertReviewData, useExpertReviewModal } from "./ExpertReviewProviders";

export function RequestReviewToolbar({
  relatedItemType,
  relatedItemId,
  relatedItemTitle,
  relatedHref,
  compact,
  existingOverride,
}: {
  relatedItemType: string;
  relatedItemId: string;
  relatedItemTitle: string;
  relatedHref?: string;
  compact?: boolean;
  existingOverride?: ExpertReviewPublicJson | null;
}) {
  const { data: session, status } = useSession();
  const { openRequestModal } = useExpertReviewModal();
  const { getLatestForItem } = useExpertReviewData();
  const existing = existingOverride ?? getLatestForItem(relatedItemType, relatedItemId) ?? null;
  const canSubmit = canSubmitExpertReview(session?.user?.role);
  const showButton =
    canSubmit && openRequestModal && status === "authenticated" && (!existing || existing.status === "COMPLETED");

  if (!existing && !showButton) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "rounded-xl border border-stone-200/70 bg-white/60 px-3 py-2 ring-1 ring-teal-100/80"}`}
    >
      {existing ? (
        <ExpertReviewStatusPill statusKey={existing.status} categoryLabel={existing.categoryLabel} />
      ) : null}
      {showButton ? (
        <button
          type="button"
          aria-label={`Request expert review for ${relatedItemTitle}`}
          onClick={() =>
            openRequestModal({
              relatedItemType,
              relatedItemId,
              relatedItemTitle,
              relatedHref,
            })
          }
          className="rounded-lg border border-teal-200/90 bg-teal-50/80 px-3 py-1.5 text-xs font-semibold text-teal-950 shadow-sm transition-colors hover:bg-teal-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80"
        >
          {EXPERT_REVIEW_ACTION_LABEL}
        </button>
      ) : null}
    </div>
  );
}

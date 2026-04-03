"use client";

import { useSession } from "next-auth/react";
import { GC_FLAG_ACTION_LABEL, type GcItemType } from "@/lib/gc-review/constants";
import { canFlagForGcReview } from "@/lib/gc-review/permissions";
import type { GcReviewPublicJson } from "@/lib/gc-review/serialize";
import { GcReviewStatusPill } from "./GcReviewStatusPill";
import { useGcReviewData, useGcReviewModal } from "./GcReviewProviders";

export function GcReviewItemToolbar({
  organizationId,
  itemType,
  itemId,
  itemTitle,
  compact,
  existing: existingOverride,
}: {
  organizationId: string;
  itemType: GcItemType;
  itemId: string;
  itemTitle: string;
  compact?: boolean;
  existing?: GcReviewPublicJson | null;
}) {
  const { data: session, status } = useSession();
  const { openFlagModal } = useGcReviewModal();
  const { getForItem } = useGcReviewData();
  const existing = existingOverride ?? getForItem(itemType, itemId) ?? null;
  const canFlag = canFlagForGcReview(session?.user?.role);
  const showFlag =
    Boolean(organizationId) &&
    canFlag &&
    openFlagModal &&
    status === "authenticated" &&
    (!existing || existing.statusKey === "COMPLETE");

  if (!existing && !showFlag) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "rounded-xl border border-stone-200/70 bg-stone-50/40 px-3 py-2 ring-1 ring-stone-100/80"}`}
    >
      {existing ? <GcReviewStatusPill statusKey={existing.statusKey} /> : null}
      {showFlag ? (
        <button
          type="button"
          aria-label={`Flag ${itemTitle} for General Counsel review`}
          onClick={() => openFlagModal({ organizationId, itemType, itemId, itemTitle })}
          className="rounded-lg border border-stone-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/80"
        >
          {GC_FLAG_ACTION_LABEL}
        </button>
      ) : null}
    </div>
  );
}

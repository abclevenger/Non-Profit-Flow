"use client";

import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";
import type { RiskItem } from "@/lib/mock-data/types";
import { RiskCard } from "./RiskCard";

export type RiskGridProps = {
  risks: RiskItem[];
  organizationIdForGc?: string;
};

export function RiskGrid({ risks, organizationIdForGc }: RiskGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {risks.map((r) => (
        <RiskCard
          key={r.category}
          {...r}
          gcReviewFooter={
            organizationIdForGc ? (
              <BoardItemReviewActions
                organizationId={organizationIdForGc}
                gcItemType="procurement"
                expertItemType="procurement"
                itemId={`procurement-${encodeURIComponent(r.category).slice(0, 120)}`}
                itemTitle={r.category}
                relatedHref="/risks"
                compact
              />
            ) : undefined
          }
        />
      ))}
    </div>
  );
}

"use client";

import { RequestReviewToolbar } from "@/components/expert-review/RequestReviewToolbar";
import type { TrainingModuleItem } from "@/lib/mock-data/types";
import { TrainingModuleCard } from "./TrainingModuleCard";

export function TrainingModuleList({
  modules,
  organizationIdForReviews,
}: {
  modules: TrainingModuleItem[];
  organizationIdForReviews?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.map((m) => (
        <div key={m.id} className="space-y-2">
          <TrainingModuleCard module={m} />
          {organizationIdForReviews ? (
            <RequestReviewToolbar
              relatedItemType="training"
              relatedItemId={`training-${m.id}`}
              relatedItemTitle={m.title}
              relatedHref="/training"
              compact
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

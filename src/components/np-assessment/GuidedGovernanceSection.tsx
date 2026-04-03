"use client";

import { useState } from "react";
import { getGuidedGovernance } from "@/lib/np-assessment/guided-governance";
import type { StandardsPillarCard } from "@/lib/np-assessment/standards-dashboard-model";
import { GovernanceAiButtons } from "./GovernanceAiButtons";

export function GuidedGovernanceSection({
  cards,
  organizationName,
  missionSnippet,
}: {
  cards: StandardsPillarCard[];
  organizationName?: string;
  missionSnippet?: string;
}) {
  const flagged = cards.filter((c) => c.status === "at_risk" || c.status === "critical");
  const [open, setOpen] = useState<string | null>(flagged[0]?.pillarId ?? null);

  if (flagged.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 text-sm text-emerald-950 ring-1 ring-emerald-100">
        <strong>Guided governance mode</strong> — no pillars are in At risk or Critical status for assessed items. Re-run the
        assessment as your practices evolve, or open the detailed report for deeper charts.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold text-stone-900">Guided governance mode</h2>
      <p className="text-sm text-stone-600">
        Flagged pillars show practical next steps based on common nonprofit operating standards — refine with your counsel and
        state association.
      </p>
      <div className="space-y-3">
        {flagged.map((c) => {
          const g = getGuidedGovernance(c.pillarId, c.status);
          const isOpen = open === c.pillarId;
          return (
            <div key={c.pillarId} className="rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : c.pillarId)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-semibold text-stone-900">{c.label}</span>
                <span className="text-xs font-medium text-stone-500">{isOpen ? "Hide" : "Show guidance"}</span>
              </button>
              {isOpen && g ? (
                <div className="space-y-4 border-t border-stone-100 px-4 py-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">What good looks like</h4>
                    <p className="mt-1 text-sm text-stone-700">{g.whatGoodLooksLike}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Recommended actions</h4>
                    <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
                      {g.recommendedActions.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Suggested next steps</h4>
                    <ul className="mt-1 list-inside list-disc text-sm text-stone-700">
                      {g.nextSteps.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <GovernanceAiButtons
                    pillarId={c.pillarId}
                    pillarLabel={c.label}
                    pillarSummary={c.summary}
                    organizationName={organizationName}
                    missionSnippet={missionSnippet}
                    ratingLabel={c.status === "critical" ? "Critical pillar" : "At-risk pillar"}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

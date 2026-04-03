"use client";

import { useMemo } from "react";
import { ContentProtectionShell, SensitivityBadge } from "@/components/content-protection";
import { InsightStrip } from "@/components/insights";
import { useDemoMode } from "@/lib/demo-mode-context";
import { buildGovernanceInsights, filterInsightsByHrefs } from "@/lib/insights/governanceInsights";
import { EmptyStateNote } from "@/components/dashboard/EmptyStateNote";
import { GovernanceHealthCard } from "@/components/dashboard/GovernanceHealthCard";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";

export default function GovernancePage() {
  const { profile, organizationId } = useDemoMode();
  const governanceInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    return filterInsightsByHrefs(all, new Set(["/governance"]));
  }, [profile]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Governance"
        description="Board health, policy rhythm, committees, and compliance touchpoints — written for board members, not operators."
      />
      <InsightStrip
        insights={governanceInsights}
        title="Compliance & governance prompts"
        description="Items in this demo that route to the governance workspace."
      />
      {profile.governanceNotes ? (
        <InsightCallout title="Governance notes">{profile.governanceNotes}</InsightCallout>
      ) : null}
      <GovernanceHealthCard items={profile.governance} />
      <ContentProtectionShell blockContextMenu restrictSelection showViewOnlyHint>
        <section className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">Annual compliance calendar (sample)</h3>
              <p className="mt-1 text-sm text-stone-600">Key dates your board typically watches — customize for your state and structure.</p>
            </div>
            <SensitivityBadge variant="restricted" />
          </div>
          {profile.complianceCalendar?.length ? (
            <ul className="mt-4 divide-y divide-stone-200/80">
              {profile.complianceCalendar.map((row, i) => (
                <li key={row.label} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{row.label}</p>
                    <p className="text-sm text-stone-600">{row.date}</p>
                    <p className="mt-1 text-sm font-medium text-stone-700">{row.status}</p>
                    <BoardItemReviewActions
                      organizationId={organizationId ?? ""}
                      gcItemType="compliance"
                      expertItemType="compliance"
                      itemId={`compliance-${i}`}
                      itemTitle={row.label}
                      relatedHref="/governance"
                      compact
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyStateNote title="No calendar rows yet">
              Add complianceCalendar entries in your mock profile to show sample filing and renewal dates here.
            </EmptyStateNote>
          )}
        </section>
      </ContentProtectionShell>
    </div>
  );
}
"use client";

import { InsightStrip } from "@/components/insights";
import { useDemoMode } from "@/lib/demo-mode-context";
import { buildGovernanceInsights, filterInsightsByHrefs } from "@/lib/insights/governanceInsights";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { RiskGrid } from "@/components/dashboard/RiskGrid";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { useMemo } from "react";

export default function RisksPage() {
  const { profile, organizationId } = useDemoMode();
  const riskInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    return filterInsightsByHrefs(all, new Set(["/risks"]));
  }, [profile]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Risks"
        description="Board-level risk visibility across governance, financial, compliance, staffing, and reputation — short explanations you can discuss with counsel."
      />
      <InsightStrip
        insights={riskInsights}
        title="Risk & oversight prompts"
        description="Drawn from this demo profile’s risk map and trends — not a formal risk register."
      />
      <InsightCallout title="How to read this">
        Status labels summarize current board judgment, not actuarial scores. Use this view to align on what needs deeper
        review between meetings.
      </InsightCallout>
      <RiskGrid risks={profile.risks} organizationIdForGc={organizationId ?? undefined} />
    </div>
  );
}
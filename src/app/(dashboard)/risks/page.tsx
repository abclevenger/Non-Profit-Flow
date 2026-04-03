"use client";

import { useDemoMode } from "@/lib/demo-mode-context";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import { RiskGrid } from "@/components/dashboard/RiskGrid";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function RisksPage() {
  const { profile } = useDemoMode();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Risks"
        description="Board-level risk visibility across governance, financial, compliance, staffing, and reputation — short explanations you can discuss with counsel."
      />
      <InsightCallout title="How to read this">
        Status labels summarize current board judgment, not actuarial scores. Use this view to align on what needs deeper
        review between meetings.
      </InsightCallout>
      <RiskGrid risks={profile.risks} />
    </div>
  );
}
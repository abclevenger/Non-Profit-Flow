"use client";

import { useMemo } from "react";
import { InsightStrip } from "@/components/insights";
import { useDemoMode } from "@/lib/demo-mode-context";
import { buildGovernanceInsights, filterInsightsByHrefs } from "@/lib/insights/governanceInsights";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import {
  StrategicHeader,
  StrategicInsightCallout,
  StrategicNotesPanel,
  StrategicPriorityList,
} from "@/components/strategy";

export default function StrategyPage() {
  const { profile, organizationId } = useDemoMode();
  const strategyInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    return filterInsightsByHrefs(all, new Set(["/strategy"]));
  }, [profile]);

  return (
    <div className="space-y-8">
      <StrategicHeader />
      <InsightStrip
        insights={strategyInsights}
        title="Strategic insights"
        description="Governance prompts that point back to priorities and board alignment in this demo."
      />
      <StrategicInsightCallout priorities={profile.strategicPriorities} />
      <section className="space-y-4">
        <h2 className="sr-only">All strategic priorities</h2>
        <StrategicPriorityList
          priorities={profile.strategicPriorities}
          showInlineNote={false}
          organizationIdForGc={organizationId ?? undefined}
        />
      </section>
      <StrategicNotesPanel priorities={profile.strategicPriorities} />
      {profile.strategicAlignmentNotes ? (
        <InsightCallout title="How this connects to the big picture">
          {profile.strategicAlignmentNotes}
        </InsightCallout>
      ) : null}
    </div>
  );
}
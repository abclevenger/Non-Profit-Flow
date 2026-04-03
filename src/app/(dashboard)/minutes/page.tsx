"use client";

import { ContentProtectionShell, SensitivityBadge } from "@/components/content-protection";
import { InsightStrip } from "@/components/insights";
import { InsightCallout } from "@/components/dashboard/InsightCallout";
import {
  MinutesDetailPanel,
  MinutesHeader,
  MinutesList,
  MinutesSummaryCards,
} from "@/components/minutes";
import { logContentAccess } from "@/lib/audit/clientContentAccess";
import { buildGovernanceInsights, filterInsightsByHrefs } from "@/lib/insights/governanceInsights";
import { useDemoMode } from "@/lib/demo-mode-context";
import {
  minutesByStatus,
  minutesPublicRecords,
  minutesSortByDateDesc,
  minutesSummaryStats,
} from "@/lib/minutes/minutesHelpers";
import { useCallback, useMemo, useState } from "react";

export default function MinutesPage() {
  const { profile, organizationId } = useDemoMode();
  const records = profile.meetingMinutes;
  const votes = profile.boardVotes;
  const stats = useMemo(() => minutesSummaryStats(records), [records]);
  const minutesInsights = useMemo(() => {
    const all = buildGovernanceInsights(profile);
    return filterInsightsByHrefs(all, new Set(["/minutes"]));
  }, [profile]);

  const recent = useMemo(() => minutesSortByDateDesc(records).slice(0, 4), [records]);
  const draftReview = useMemo(
    () => minutesByStatus(records, ["Draft", "In Review"]),
    [records],
  );
  const approved = useMemo(
    () => minutesByStatus(records, ["Approved", "Published"]),
    [records],
  );
  const publicOnly = useMemo(() => minutesPublicRecords(records), [records]);

  const defaultId = recent[0]?.id ?? records[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? defaultId;
  const selected = useMemo(
    () => records.find((r) => r.id === activeId) ?? recent[0] ?? records[0],
    [records, activeId, recent],
  );

  const selectMinutesRecord = useCallback(
    (id: string) => {
      setSelectedId(id);
      const rec = records.find((r) => r.id === id);
      if (rec) {
        logContentAccess({
          resourceType: "minutes",
          resourceKey: rec.id,
          href: "/minutes",
        });
      }
    },
    [records],
  );

  return (
    <div className="space-y-10">
      <MinutesHeader />
      <InsightCallout title="Records workflow">
        Coordinators track draft, review, approval, and optional publishing. Future: export to PDF, website posting, and
        search by topic — hook into the same MeetingMinutesRecord shape.
      </InsightCallout>
      <MinutesSummaryCards stats={stats} />

      <InsightStrip
        insights={minutesInsights}
        title="Minutes & records prompts"
        description="Governance nudges tied to approval workflow in this demo profile."
      />

      <ContentProtectionShell
        blockContextMenu
        restrictSelection
        showViewOnlyHint
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SensitivityBadge variant="boardOnly" />
        </div>

      <MinutesList
        title="Recent meeting records"
        description="Newest first — click a card to inspect the full record."
        records={recent}
        selectedId={activeId}
        onSelect={selectMinutesRecord}
      />

      <MinutesList
        title="Draft & in review"
        description="Minutes still moving through internal review."
        records={draftReview}
        selectedId={activeId}
        onSelect={selectMinutesRecord}
      />

      <MinutesList
        title="Approved minutes"
        description="Board-approved or published official records."
        records={approved}
        selectedId={activeId}
        onSelect={selectMinutesRecord}
      />

      <MinutesList
        title="Public meeting records"
        description="Marked for transparency — website-ready summaries when you need them."
        records={publicOnly}
        selectedId={activeId}
        onSelect={selectMinutesRecord}
      />

      {selected ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Selected record</h2>
          <MinutesDetailPanel record={selected} votes={votes} organizationIdForGc={organizationId ?? undefined} />
        </section>
      ) : null}
      </ContentProtectionShell>

      <InsightCallout>
        <span className="font-medium text-stone-800">Sample records workflow</span> for planning and discussion — not
        legal advice or a substitute for your retention policy.
      </InsightCallout>
    </div>
  );
}


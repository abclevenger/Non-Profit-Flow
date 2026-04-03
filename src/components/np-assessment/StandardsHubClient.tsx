"use client";

import Link from "next/link";
import { useWorkspace } from "@/lib/workspace-context";
import type { NpAssessmentReportModel } from "@/lib/np-assessment/scoring";
import type { StandardsPillarCard } from "@/lib/np-assessment/standards-dashboard-model";
import { computeGovernanceHealthScore } from "@/lib/np-assessment/standards-dashboard-model";
import { GuidedGovernanceSection } from "./GuidedGovernanceSection";
import { NpAssessmentConsultCta } from "./NpAssessmentConsultCta";
import { StandardsPillarGrid } from "./StandardsPillarGrid";
import { StandardsPositioningBanner } from "./StandardsPositioningBanner";

export function StandardsHubClient({
  report,
  pillarCards,
  variant = "live",
}: {
  report: NpAssessmentReportModel;
  pillarCards: StandardsPillarCard[];
  variant?: "demo" | "live";
}) {
  const { organization } = useWorkspace();
  const health = computeGovernanceHealthScore(report);
  const hasFlagged = report.overall.flagged > 0;

  return (
    <div className={hasFlagged ? "pb-28 lg:pb-8" : ""}>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 lg:px-8">
        {variant === "demo" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
            Demo organization: pillar preview uses illustrative responses. Live customers only see data from submitted
            assessments.
          </p>
        ) : null}
        <StandardsPositioningBanner />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">Standards dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Live roll-up of your organizational assessment into eight nonprofit practice pillars. Status reflects self-reported
              answers (Met, Needs Work, Don’t Know, N/A).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/assessment/report"
              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
            >
              Full assessment report
            </Link>
            <Link
              href="/assessment/executive-report"
              className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              Executive report
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Governance health index</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-stone-900">{health}</p>
            <p className="mt-1 text-xs text-stone-500">0–100, board-facing summary score</p>
          </div>
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Practice areas flagged</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-stone-900">{report.categoriesNeedingConsult}</p>
            <p className="mt-1 text-xs text-stone-500">Assessment sections with any non-Met response</p>
          </div>
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm ring-1 ring-stone-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Essential gaps</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-stone-900">{report.essentialFlaggedCount}</p>
            <p className="mt-1 text-xs text-stone-500">Essential-rated items not Met</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Pillar status</h2>
          <StandardsPillarGrid cards={pillarCards} />
        </section>

        <GuidedGovernanceSection
          cards={pillarCards}
          organizationName={organization?.name}
          missionSnippet={organization?.missionSnippet ?? undefined}
        />

        {hasFlagged ? (
          <div className="hidden lg:block">
            <NpAssessmentConsultCta variant="sidebar" />
          </div>
        ) : null}
      </div>

      {hasFlagged ? (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden print:hidden">
          <NpAssessmentConsultCta variant="mobile_bar" />
        </div>
      ) : null}
    </div>
  );
}

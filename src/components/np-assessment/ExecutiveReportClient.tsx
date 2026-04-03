"use client";

import type { ExecutiveReportModel } from "@/lib/np-assessment/standards-dashboard-model";
import type { NpAssessmentReportModel } from "@/lib/np-assessment/scoring";
import { STANDARDS_POSITIONING } from "@/lib/np-assessment/standards-framework";

export function ExecutiveReportClient({
  report,
  executive,
  organizationName,
}: {
  report: NpAssessmentReportModel;
  executive: ExecutiveReportModel;
  organizationName?: string;
}) {
  return (
    <div className="executive-report-print mx-auto max-w-3xl space-y-8 px-4 py-8 lg:px-8">
      <header className="border-b border-stone-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{STANDARDS_POSITIONING.subtitle}</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-stone-900">Executive governance summary</h1>
        <p className="mt-2 text-sm text-stone-600">
          {organizationName ? `${organizationName} · ` : ""}
          Board-level overview — not operational detail. For internal planning; not legal advice.
        </p>
      </header>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Governance health</h2>
        <p className="mt-2 font-serif text-4xl font-semibold text-stone-900">{executive.governanceHealthScore}</p>
        <p className="text-sm text-stone-600">Index 0–100 from self-assessment responses and Essential gaps.</p>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Top risk areas (pillars)</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">
          {executive.topRiskAreas.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Priority actions</h2>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-stone-700">
          {executive.priorityActions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Board narrative</h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-stone-700">
          {executive.boardSummaryBullets.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-stone-400">•</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-stone-50 p-4 text-xs text-stone-600 print:border print:border-stone-200">
        <p>
          Consult signals: {report.consultBanner.replace(/_/g, " ")} · Categories with flags: {report.categoriesNeedingConsult} ·
          Weighted risk index: {report.overall.weightedRiskTotal}
        </p>
      </section>

      <div className="print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Export PDF (print)
        </button>
        <p className="mt-2 text-xs text-stone-500">Use your browser’s print dialog → Save as PDF.</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export function AssessmentReportToolbar({
  organizationId,
  assessmentId,
}: {
  organizationId: string;
  /** Omit CSV export when there is no submitted assessment (e.g. demo sample view). */
  assessmentId: string | null;
}) {
  const exportHref =
    assessmentId != null
      ? `/api/organizations/${organizationId}/np-assessments/${assessmentId}/export`
      : null;

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
      >
        Print / Save PDF
      </button>
      {exportHref ? (
        <a
          href={exportHref}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          Export CSV
        </a>
      ) : (
        <span
          className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-400"
          title="Submit an assessment to enable CSV export."
        >
          Export CSV
        </span>
      )}
      <Link
        href="/assessment"
        className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        All assessments
      </Link>
    </div>
  );
}

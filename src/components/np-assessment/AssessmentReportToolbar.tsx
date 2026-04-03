"use client";

import Link from "next/link";

export function AssessmentReportToolbar({
  organizationId,
  assessmentId,
}: {
  organizationId: string;
  assessmentId: string;
}) {
  const exportHref = `/api/organizations/${organizationId}/np-assessments/${assessmentId}/export`;

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
      >
        Print / Save PDF
      </button>
      <a
        href={exportHref}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
      >
        Export CSV
      </a>
      <Link
        href="/assessment"
        className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        All assessments
      </Link>
    </div>
  );
}

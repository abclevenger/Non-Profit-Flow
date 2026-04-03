"use client";

import Link from "next/link";

const DEFAULT_HREF = "https://www.missionimpactlegal.com/contact";

export function NpAssessmentConsultCta({
  variant = "sidebar",
  href = DEFAULT_HREF,
}: {
  variant?: "sidebar" | "mobile_bar";
  href?: string;
}) {
  if (variant === "mobile_bar") {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-stone-200/90 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <p className="min-w-0 text-sm font-medium text-stone-800">Flagged items may need advisor input.</p>
        <Link
          href={href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Schedule a Consult
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 shadow-sm ring-1 ring-amber-100">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Schedule a Consult</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        One or more practices are not marked <span className="font-medium text-emerald-800">Met</span>. Mission Impact Legal
        Advisors can help you prioritize remediation and board-ready next steps.
      </p>
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Schedule a Consult
      </Link>
    </div>
  );
}

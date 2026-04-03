"use client";

import Link from "next/link";
import type { ConsultBannerLevel } from "@/lib/np-assessment/scoring";

const DEFAULT_CONTACT_HREF = "https://www.mission-impact.legal/contact";

export function OverviewConsultBanner({
  level,
  essentialFlaggedCount,
  categoriesNeedingConsult,
  href = DEFAULT_CONTACT_HREF,
  reportHref = "/assessment/report",
}: {
  level: ConsultBannerLevel;
  essentialFlaggedCount: number;
  categoriesNeedingConsult: number;
  href?: string;
  /** Full report link (e.g. demo tenants use standards hub when no DB report id). */
  reportHref?: string;
}) {
  if (level === "none") return null;

  const styles =
    level === "urgent_category"
      ? "border-red-300/90 bg-gradient-to-br from-red-50 to-orange-50 ring-red-100"
      : level === "priority"
        ? "border-amber-300/90 bg-gradient-to-br from-amber-50 to-orange-50 ring-amber-100"
        : "border-amber-200/90 bg-gradient-to-br from-amber-50 to-stone-50 ring-amber-100";

  const priorityTitle = "Priority consult recommended";
  const consultTitle = "Consult recommended";

  const title =
    level === "urgent_category" || level === "priority" ? priorityTitle : consultTitle;

  const body =
    level === "urgent_category"
      ? "Multiple essential indicators in at least one category are not marked Met. Non-Profit Flow can help you prioritize board-ready next steps."
      : level === "priority"
        ? `${essentialFlaggedCount} essential indicator${essentialFlaggedCount === 1 ? "" : "s"} ${essentialFlaggedCount === 1 ? "is" : "are"} not marked Met. Consider advisor support to address governance gaps.`
        : `${categoriesNeedingConsult} categor${categoriesNeedingConsult === 1 ? "y" : "ies"} include responses that are not Met. An advisor can help interpret results and plan follow-up.`;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ring-1 ${styles}`}>
      <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-800">{body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Schedule a consult
        </Link>
        <Link
          href={reportHref}
          className="inline-flex rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          View full report
        </Link>
      </div>
    </div>
  );
}

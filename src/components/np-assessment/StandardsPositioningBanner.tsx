import Link from "next/link";
import { STANDARDS_POSITIONING } from "@/lib/np-assessment/standards-framework";

export function StandardsPositioningBanner() {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50 to-amber-50/30 p-5 shadow-sm ring-1 ring-stone-100">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{STANDARDS_POSITIONING.subtitle}</p>
      <h2 className="mt-1 font-serif text-xl font-semibold text-stone-900">{STANDARDS_POSITIONING.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{STANDARDS_POSITIONING.disclaimer}</p>
      <p className="mt-3 text-sm">
        <Link
          href={STANDARDS_POSITIONING.referenceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-stone-800 underline-offset-4 hover:underline"
        >
          {STANDARDS_POSITIONING.referenceLabel}
        </Link>
      </p>
    </div>
  );
}

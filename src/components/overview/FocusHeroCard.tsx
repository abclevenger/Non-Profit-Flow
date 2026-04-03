"use client";

import Link from "next/link";
import type { FocusCardVariant } from "@/lib/overview/overviewFocusModel";

const shell: Record<FocusCardVariant, string> = {
  red: "border-l-[8px] border-l-rose-500 bg-gradient-to-br from-rose-50/90 to-white ring-1 ring-rose-100/90 shadow-md shadow-rose-100/40",
  yellow:
    "border-l-[8px] border-l-amber-400 bg-gradient-to-br from-amber-50/80 to-white ring-1 ring-amber-100/90 shadow-md shadow-amber-100/30",
  orange:
    "border-l-[8px] border-l-orange-400 bg-gradient-to-br from-orange-50/70 to-white ring-1 ring-orange-100/80 shadow-md shadow-orange-100/25",
  green:
    "border-l-[8px] border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 to-white ring-1 ring-emerald-100/80 shadow-md shadow-emerald-100/30",
};

export function FocusHeroCard({
  variant,
  title,
  body,
  cta,
  href,
  disabled,
}: {
  variant: FocusCardVariant;
  title: string;
  body: string;
  cta: string;
  href: string;
  disabled?: boolean;
}) {
  const inner = (
    <>
      <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-stone-600">{body}</p>
      {!disabled ? (
        <span className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-stone-900">
          {cta} <span className="ml-2">→</span>
        </span>
      ) : (
        <p className="mt-6 text-sm text-stone-500">Not available for your role in this demo.</p>
      )}
    </>
  );

  const base =
    `rounded-2xl p-8 transition-all duration-200 ${shell[variant]} ` +
    (disabled ? "cursor-default" : "hover:-translate-y-1 hover:shadow-lg");

  if (disabled) {
    return <div className={base}>{inner}</div>;
  }

  return (
    <Link
      href={href}
      className={`${base} block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400`}
    >
      {inner}
    </Link>
  );
}

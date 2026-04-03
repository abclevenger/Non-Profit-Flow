"use client";

import Link from "next/link";
import type { StartHereCardModel, StartHereTone } from "@/lib/overview/overviewDashboardModel";

const toneStyles: Record<
  StartHereTone,
  { bar: string; label: string; labelText: string }
> = {
  urgent: {
    bar: "border-l-[6px] border-l-rose-500 bg-white shadow-sm ring-1 ring-rose-100/90",
    label: "bg-rose-100 text-rose-900 ring-rose-200/80",
    labelText: "Urgent",
  },
  attention: {
    bar: "border-l-[6px] border-l-amber-400 bg-white shadow-sm ring-1 ring-amber-100/90",
    label: "bg-amber-100 text-amber-950 ring-amber-200/80",
    labelText: "Needs attention",
  },
  ok: {
    bar: "border-l-[6px] border-l-emerald-500 bg-white shadow-sm ring-1 ring-emerald-100/80",
    label: "bg-emerald-100 text-emerald-950 ring-emerald-200/70",
    labelText: "On track",
  },
  muted: {
    bar: "border-l-[6px] border-l-stone-300 bg-stone-50/90 shadow-sm ring-1 ring-stone-200/80",
    label: "bg-stone-200/80 text-stone-700 ring-stone-300/70",
    labelText: "FYI",
  },
};

export function StartHereCard({ card }: { card: StartHereCardModel }) {
  const t = toneStyles[card.tone];
  const inner = (
    <>
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${t.label}`}
      >
        {t.labelText}
      </span>
      <p className="mt-3 font-serif text-lg font-semibold leading-snug text-stone-900">{card.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{card.subtitle}</p>
      {!card.disabled ? (
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-stone-800">Go →</p>
      ) : (
        <p className="mt-4 text-xs font-medium text-stone-500">Limited access for your role — ask an admin.</p>
      )}
    </>
  );

  const className = `block rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${t.bar}`;

  if (card.disabled) {
    return <div className={`${className} cursor-default`}>{inner}</div>;
  }

  return (
    <Link href={card.href} className={`${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400`}>
      {inner}
    </Link>
  );
}

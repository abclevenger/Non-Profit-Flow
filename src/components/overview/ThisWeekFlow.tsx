"use client";

import Link from "next/link";
import type { ThisWeekStepModel } from "@/lib/overview/overviewFocusModel";

export function ThisWeekFlow({ steps }: { steps: ThisWeekStepModel[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-6 pb-10 last:pb-0">
          {i < steps.length - 1 ? (
            <div
              className="absolute left-[19px] top-10 h-[calc(100%-0.5rem)] w-px bg-stone-200"
              aria-hidden
            />
          ) : null}
          <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white shadow-md ring-4 ring-[#f7f5f2]">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100/80">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{step.label}</p>
            <ul className="mt-4 space-y-3">
              {step.items.map((item, j) => (
                <li key={j} className="text-sm leading-relaxed text-stone-700">
                  {item.href ? (
                    <Link href={item.href} className="font-medium text-stone-900 underline-offset-4 hover:underline">
                      {item.text}
                    </Link>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

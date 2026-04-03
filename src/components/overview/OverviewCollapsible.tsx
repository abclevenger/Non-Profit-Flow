"use client";

import type { ReactNode } from "react";

export function OverviewCollapsible({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-stone-200/90 bg-white/70 shadow-sm ring-1 ring-stone-100/60">
      <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-stone-900 transition-colors marker:hidden hover:bg-stone-50/80 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          {title}
          <span className="text-xs font-normal text-stone-500 group-open:hidden">Show</span>
          <span className="hidden text-xs font-normal text-stone-500 group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="border-t border-stone-200/70 px-6 py-6">{children}</div>
    </details>
  );
}

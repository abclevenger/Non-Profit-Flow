"use client";

import { useState, type ReactNode } from "react";

export type OverviewTab = { id: string; label: string; content: ReactNode };

export function OverviewMoreDetailsTabs({ tabs }: { tabs: OverviewTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  const panel = tabs.find((t) => t.id === active);

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white shadow-md ring-1 ring-stone-100/80">
      <div className="border-b border-stone-200/80 px-2 pt-2 sm:px-4">
        <p className="px-2 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-500 sm:px-2">More details</p>
        <div
          className="flex flex-wrap gap-1 sm:gap-2"
          role="tablist"
          aria-label="Overview detail sections"
        >
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(t.id)}
                className={`rounded-t-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#f7f5f2] text-stone-900 ring-1 ring-b-0 ring-stone-200/80"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        role="tabpanel"
        className="bg-[#f7f5f2]/80 p-6 sm:p-8"
        aria-live="polite"
      >
        <div className="space-y-8">{panel?.content}</div>
      </div>
    </div>
  );
}

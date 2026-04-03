import type { ReactNode } from "react";

export type InsightCalloutProps = {
  title?: string;
  children: ReactNode;
};

export function InsightCallout({ title, children }: InsightCalloutProps) {
  return (
    <aside
      className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm leading-relaxed text-stone-700 ring-1 ring-stone-200/60"
      role="note"
    >
      {title ? <p className="font-semibold text-stone-900">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </aside>
  );
}
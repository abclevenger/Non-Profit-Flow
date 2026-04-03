import type { ReactNode } from "react";

export function OverviewDashboardSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-6">
      <header className="space-y-2 border-b border-stone-200/80 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">{eyebrow}</p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-relaxed text-stone-600">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

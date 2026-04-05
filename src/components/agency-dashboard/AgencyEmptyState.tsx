import type { ReactNode } from "react";

export function AgencyEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300/90 bg-stone-50/80 px-8 py-14 text-center">
      <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

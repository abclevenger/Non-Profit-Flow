import type { StandardsPillarCard } from "@/lib/np-assessment/standards-dashboard-model";

function statusLabel(s: StandardsPillarCard["status"]): string {
  switch (s) {
    case "healthy":
      return "Healthy";
    case "at_risk":
      return "At risk";
    case "critical":
      return "Critical";
    default:
      return "Not assessed";
  }
}

function statusStyle(s: StandardsPillarCard["status"]): string {
  switch (s) {
    case "healthy":
      return "border-emerald-200/90 bg-emerald-50/50 ring-emerald-100";
    case "at_risk":
      return "border-amber-200/90 bg-amber-50/40 ring-amber-100";
    case "critical":
      return "border-red-200/90 bg-red-50/50 ring-red-100";
    default:
      return "border-stone-200/80 bg-stone-50/60 ring-stone-100";
  }
}

export function StandardsPillarGrid({ cards }: { cards: StandardsPillarCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <article
          key={c.pillarId}
          className={`flex flex-col rounded-2xl border p-4 shadow-sm ring-1 ${statusStyle(c.status)}`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-base font-semibold text-stone-900">{c.label}</h3>
            <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200/80">
              {statusLabel(c.status)}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-stone-600" title={c.summary}>
            {c.summary}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-stone-200/60">
              <dt className="font-semibold text-stone-500">% Met</dt>
              <dd className="font-serif text-lg font-semibold text-stone-900">
                {c.answered === 0 ? "—" : `${c.percentMet}%`}
              </dd>
            </div>
            <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-stone-200/60">
              <dt className="font-semibold text-stone-500">Flagged</dt>
              <dd className="font-serif text-lg font-semibold text-stone-900">{c.flaggedCount}</dd>
            </div>
          </dl>
          {c.consultRecommended ? (
            <p className="mt-3 text-xs font-semibold text-amber-900">Consult recommended</p>
          ) : c.answered > 0 ? (
            <p className="mt-3 text-xs font-medium text-emerald-800">No open flags in assessed items</p>
          ) : (
            <p className="mt-3 text-xs text-stone-500">Awaiting assessment items in this pillar</p>
          )}
        </article>
      ))}
    </div>
  );
}

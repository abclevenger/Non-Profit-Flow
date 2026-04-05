import Link from "next/link";
import type { AgencyConsultRow } from "@/lib/agency-dashboard/types";

const MAX = 8;

export function AgencyConsultOpportunitiesPreview({
  agencyId,
  rows,
}: {
  agencyId: string;
  rows: AgencyConsultRow[];
}) {
  const top = rows.slice(0, MAX);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Consult opportunities</h2>
        <Link href={`/agency/${agencyId}/consult`} className="text-sm font-semibold text-stone-800 underline">
          Full queue
        </Link>
      </div>
      {top.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">No open consult signals across this portfolio.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {top.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-stone-200/90 bg-white/90 px-4 py-3 text-sm shadow-sm ring-1 ring-stone-100/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-stone-900">{r.organizationName}</span>
                <span className="text-xs text-stone-500">{r.flaggedAt.toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-stone-600">
                <span className="font-semibold text-stone-700">{r.source === "gc_review" ? "GC" : "Assessment"}</span>
                {r.ratingType === "E" ? (
                  <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-900">
                    Essential
                  </span>
                ) : null}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-stone-600">{r.summary}</p>
              <Link
                href={r.itemHref ?? `/agency/${agencyId}/consult`}
                className="mt-2 inline-block text-xs font-semibold text-stone-800 underline"
              >
                Open item
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

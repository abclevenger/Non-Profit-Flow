import type { OrganizationProfile } from "@/lib/mock-data/types";

export type OrganizationSummaryProps = Pick<
  OrganizationProfile,
  "organizationName" | "missionSnippet" | "reportingPeriod" | "boardChair" | "executiveDirector"
>;

export function OrganizationSummary({
  organizationName,
  missionSnippet,
  reportingPeriod,
  boardChair,
  executiveDirector,
}: OrganizationSummaryProps) {
  return (
    <section className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl font-semibold text-stone-900">{organizationName}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{missionSnippet}</p>
        </div>
        <dl className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2 lg:shrink-0 lg:text-right">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reporting period</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{reportingPeriod}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Board chair</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{boardChair}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Executive director</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{executiveDirector}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
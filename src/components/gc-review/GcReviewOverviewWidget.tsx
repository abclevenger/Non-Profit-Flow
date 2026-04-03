"use client";

import Link from "next/link";
import { useId } from "react";
import { useSession } from "@/lib/auth/session-hooks";
import { canFlagForGcReview } from "@/lib/gc-review/permissions";
import { useGcReviewData } from "./GcReviewProviders";

function formatDeadline(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return null;
  }
}

function WidgetSkeleton() {
  return (
    <div className="min-h-[140px] rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm ring-1 ring-stone-100/80">
      <div className="h-5 w-56 animate-pulse rounded-md bg-stone-200/70" />
      <div className="mt-3 h-4 w-full max-w-xs animate-pulse rounded-md bg-stone-100/90" />
    </div>
  );
}

export function GcReviewOverviewWidget() {
  const headingId = useId();
  const { data: session, status } = useSession();
  const { summary, loading, error } = useGcReviewData();

  if (status === "loading") {
    return <WidgetSkeleton />;
  }

  if (!session?.user || !canFlagForGcReview(session.user.role)) {
    return null;
  }

  const pending = summary?.pendingCount ?? 0;
  const highRisk = summary?.highRiskOpenCount ?? 0;
  const nextDl = formatDeadline(summary?.nextUrgentDeadline ?? null);
  const isQuiet = pending === 0 && highRisk === 0;

  return (
    <section
      className="min-h-[140px] rounded-2xl border bg-gradient-to-br from-white to-stone-50/50 p-6 shadow-sm ring-1 ring-stone-100/70"
      style={{
        borderColor: "color-mix(in srgb, var(--primary-color, #6b5344) 28%, #e7e5e4)",
      }}
      aria-labelledby={headingId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-serif text-lg font-semibold text-stone-900">
            General Counsel Review
          </h2>
          {loading ? (
            <div className="mt-3 space-y-2" aria-busy="true" aria-label="Updating queue">
              <div
                className="h-4 w-44 animate-pulse rounded-md"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--primary-color, #78716c) 18%, #f5f5f4)",
                }}
              />
            </div>
          ) : error ? (
            <p className="mt-2 text-sm text-rose-700" role="alert" aria-live="polite">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-sm text-stone-600">
              {isQuiet ? (
                <>Queue is clear for this profile — flag anything that needs a second set of eyes.</>
              ) : (
                <>
                  <span className="font-medium text-stone-800">
                    {pending} item{pending === 1 ? "" : "s"} pending
                  </span>
                  {highRisk > 0 ? (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-medium text-rose-800">
                        {highRisk} high-risk review{highRisk === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </p>
          )}
          {nextDl && !isQuiet ? (
            <p className="mt-1 text-xs text-stone-500">Next urgent deadline: {nextDl}</p>
          ) : null}
        </div>
        <Link
          href="/general-counsel"
          className="shrink-0 rounded-xl border border-stone-200/90 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary-color)_45%,transparent)]"
        >
          View review queue
        </Link>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useId } from "react";
import { useSession } from "next-auth/react";
import { canAccessReviewsQueue } from "@/lib/expert-review/permissions";
import { useExpertReviewData } from "./ExpertReviewProviders";

function fmtTime(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return null;
  }
}

function WidgetSkeleton() {
  return (
    <div className="min-h-[140px] rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm ring-1 ring-stone-100/80">
      <div className="h-5 w-48 animate-pulse rounded-md bg-stone-200/70" />
      <div className="mt-3 h-4 w-full max-w-xs animate-pulse rounded-md bg-stone-100/90" />
      <div className="mt-2 h-3 w-56 animate-pulse rounded-md bg-stone-100/80" />
    </div>
  );
}

export function ExpertReviewOverviewWidget() {
  const headingId = useId();
  const { data: session, status } = useSession();
  const { summary, loading, error } = useExpertReviewData();

  if (status === "loading") {
    return <WidgetSkeleton />;
  }

  if (!session?.user?.role || !canAccessReviewsQueue(session.user.role)) {
    return null;
  }

  const open = summary?.openCount ?? 0;
  const urgent = summary?.urgentOpenCount ?? 0;
  const last = summary?.lastSubmitted;

  return (
    <section
      className="min-h-[140px] rounded-2xl border bg-gradient-to-br from-white to-stone-50/60 p-6 shadow-sm ring-1 ring-stone-100/70"
      style={{
        borderColor: "color-mix(in srgb, var(--secondary-color, #5c7a7a) 38%, #e7e5e4)",
      }}
      aria-labelledby={headingId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-serif text-lg font-semibold text-stone-900">
            Requests for Review
          </h2>
          {loading ? (
            <div className="mt-3 space-y-2" aria-busy="true" aria-label="Updating counts">
              <div
                className="h-4 w-40 animate-pulse rounded-md"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--secondary-color, #5c7a7a) 22%, #f5f5f4)",
                }}
              />
            </div>
          ) : error ? (
            <p className="mt-2 text-sm text-rose-700" role="alert" aria-live="polite">
              {error}
            </p>
          ) : (
            <p className="mt-2 text-sm text-stone-600">
              <span className="font-medium text-stone-800">
                {open} open request{open === 1 ? "" : "s"}
              </span>
              {urgent > 0 ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-medium text-rose-800">
                    {urgent} urgent
                  </span>
                </>
              ) : null}
            </p>
          )}
          {last ? (
            <p className="mt-1 text-xs text-stone-500">
              Last submitted: {last.subject}
              {fmtTime(last.createdAt) ? ` · ${fmtTime(last.createdAt)}` : ""}
            </p>
          ) : !loading ? (
            <p className="mt-1 text-xs text-stone-500">
              When you route a question, it shows up here so nothing slips through the cracks.
            </p>
          ) : null}
        </div>
        <Link
          href="/reviews"
          className="shrink-0 rounded-xl border border-stone-200/90 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary-color)_45%,transparent)]"
        >
          View Requests
        </Link>
      </div>
    </section>
  );
}

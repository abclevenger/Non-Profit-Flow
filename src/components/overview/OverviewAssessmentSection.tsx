"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StandardsPillarGrid } from "@/components/np-assessment/StandardsPillarGrid";
import type { ConsultBannerLevel } from "@/lib/np-assessment/scoring";
import type { StandardsPillarCard } from "@/lib/np-assessment/standards-dashboard-model";
import { OverviewConsultBanner } from "./OverviewConsultBanner";

type CompletedPayload = {
  assessmentId: string;
  demoSeeded: boolean;
  consultBanner: ConsultBannerLevel;
  essentialFlaggedCount: number;
  categoriesNeedingConsult: number;
  overall: {
    totalQuestions: number;
    answered: number;
    met: number;
    flagged: number;
    percentMet: number;
    percentFlagged: number;
    weightedRiskTotal: number;
    naFlagged: number;
  };
  pillarCards: StandardsPillarCard[];
};

type OverviewAssessmentPayload =
  | { eligible: false }
  | {
      eligible: true;
      isDemoTenant: boolean;
      canCreateAssessment: boolean;
      catalogQuestionCount: number;
      completed: null | CompletedPayload;
      openRun: null | {
        id: string;
        title: string;
        status: string;
        answeredCount: number;
        totalQuestions: number;
      };
    };

function completionLabel(answered: number, total: number): string {
  if (total <= 0) return "Not started";
  if (answered >= total) return "Complete";
  return "In progress";
}

export function OverviewAssessmentSection({ organizationId }: { organizationId: string | null }) {
  const [data, setData] = useState<OverviewAssessmentPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) {
      setData(null);
      return;
    }
    setError(null);
    try {
      const r = await fetch(`/api/organizations/${organizationId}/overview-assessment`, {
        credentials: "include",
        cache: "no-store",
      });
      const j = (await r.json()) as OverviewAssessmentPayload & { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setData(j as OverviewAssessmentPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assessment summary");
      setData(null);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!organizationId) return null;

  if (data === null && !error) {
    return (
      <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-6 animate-pulse">
        <div className="h-4 w-48 rounded bg-stone-200/80" />
        <div className="h-24 rounded-xl bg-stone-200/60" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        {error}
      </section>
    );
  }

  if (!data || !("eligible" in data) || data.eligible === false) {
    return null;
  }

  const { completed, openRun, canCreateAssessment, isDemoTenant, catalogQuestionCount } = data;

  const showEmptyLiveCta = !completed && !isDemoTenant && catalogQuestionCount > 0;
  const showEmptyNoCatalog = !completed && catalogQuestionCount === 0;

  const reportHref =
    completed?.demoSeeded === true ? "/assessment/standards" : "/assessment/report";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-stone-900">Organizational assessment</h2>
        <p className="mt-1 max-w-2xl text-sm text-stone-600">
          Board health and standards below come from your latest completed assessment (saved responses only). Live
          organizations never use sample scores here.
        </p>
      </div>

      {isDemoTenant ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          <span className="font-semibold">Demo</span>
          {completed?.demoSeeded
            ? " — board health and pillars below use seeded sample responses until you submit a completed run."
            : " — this workspace is marked as a demonstration tenant."}
        </p>
      ) : null}

      {/* Board health + status */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
        {completed ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Board health</p>
                <p
                  className={`mt-1 text-xs font-semibold uppercase tracking-wide ${completed.demoSeeded ? "text-amber-800" : "text-emerald-800"}`}
                >
                  {completed.demoSeeded ? "Sample data" : "Live data"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-3 ring-1 ring-stone-100/80">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Readiness (% Met)</p>
                    <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">{completed.overall.percentMet}%</p>
                    <p className="mt-1 text-xs text-stone-600">Of answered items marked Met</p>
                  </div>
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-3 ring-1 ring-stone-100/80">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Completion</p>
                    <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                      {completed.overall.answered}/{completed.overall.totalQuestions}
                    </p>
                    <p className="mt-1 text-xs text-stone-600">{completionLabel(completed.overall.answered, completed.overall.totalQuestions)}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-3 ring-1 ring-stone-100/80">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Flagged categories</p>
                    <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">{completed.categoriesNeedingConsult}</p>
                    <p className="mt-1 text-xs text-stone-600">Sections with any non-Met response</p>
                  </div>
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-3 ring-1 ring-stone-100/80">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Essential flagged</p>
                    <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">{completed.essentialFlaggedCount}</p>
                    <p className="mt-1 text-xs text-stone-600">Essential-rated items not Met</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {completed.demoSeeded ? (
                  <>
                    <Link
                      href="/assessment/standards"
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                      style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                    >
                      Standards dashboard
                    </Link>
                    <Link
                      href="/assessment"
                      className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
                    >
                      Assessments
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/assessment/report?assessmentId=${completed.assessmentId}`}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                      style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                    >
                      Open report
                    </Link>
                    <Link
                      href="/assessment/executive-report"
                      className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
                    >
                      Executive summary
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : showEmptyNoCatalog ? (
          <p className="text-sm text-stone-600">
            Assessment question catalog is not available. Run database setup, then return here.
          </p>
        ) : showEmptyLiveCta ? (
          <div className="space-y-3">
            <p className="text-sm text-stone-700">
              No completed assessment yet for this organization. Submit a run to unlock board health and standards from your
              saved answers.
            </p>
            <div className="flex flex-wrap gap-2">
              {openRun ? (
                <Link
                  href={`/assessment/take/${openRun.id}`}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                >
                  Continue in-progress assessment
                </Link>
              ) : canCreateAssessment ? (
                <Link
                  href="/assessment"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                >
                  Start Assessment
                </Link>
              ) : (
                <Link
                  href="/assessment"
                  className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-800"
                >
                  View assessments
                </Link>
              )}
            </div>
            {!canCreateAssessment && !openRun ? (
              <p className="text-xs text-stone-500">Ask an organization administrator to start the first assessment run.</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-stone-700">No completed assessment yet.</p>
            <div className="flex flex-wrap gap-2">
              {openRun ? (
                <Link
                  href={`/assessment/take/${openRun.id}`}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                >
                  Continue assessment
                </Link>
              ) : null}
              <Link
                href="/assessment"
                className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm"
              >
                Go to assessments
              </Link>
            </div>
          </div>
        )}

        {openRun && completed ? (
          <div className="mt-4 border-t border-stone-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Also in progress</p>
            <p className="mt-1 text-sm text-stone-700">
              {openRun.title} · {openRun.answeredCount}/{openRun.totalQuestions} questions answered
            </p>
            <Link href={`/assessment/take/${openRun.id}`} className="mt-2 inline-block text-sm font-semibold text-stone-900 underline-offset-4 hover:underline">
              Continue →
            </Link>
          </div>
        ) : null}
      </div>

      {completed && completed.consultBanner !== "none" ? (
        <OverviewConsultBanner
          level={completed.consultBanner}
          essentialFlaggedCount={completed.essentialFlaggedCount}
          categoriesNeedingConsult={completed.categoriesNeedingConsult}
          reportHref={reportHref}
        />
      ) : null}

      {completed && completed.pillarCards.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Standards / pillar health</p>
          <p className="mb-3 text-sm text-stone-600">
            Rolled up from the same responses as board health. Status uses stored answers only (healthy, at risk, critical).
          </p>
          <StandardsPillarGrid cards={completed.pillarCards} />
        </div>
      ) : !completed ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 p-5 text-sm text-stone-600">
          Standards and pillar cards appear after a completed assessment (or demo preview when enabled).
        </div>
      ) : null}
    </section>
  );
}

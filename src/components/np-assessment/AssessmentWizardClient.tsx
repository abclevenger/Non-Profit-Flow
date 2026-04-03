"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NpAnswerValue } from "@/lib/np-assessment/answers";
import { NP_ANSWER_LABEL } from "@/lib/np-assessment/answers";
import type { NpSeedCategory } from "@/lib/np-assessment/question-bank/types";

const ANSWERS: NpAnswerValue[] = ["MET", "NEEDS_WORK", "DONT_KNOW", "NA"];

type WorkspaceJson = {
  assessment: {
    id: string;
    title: string;
    status: string;
    currentCategoryIndex: number;
    submittedAt: string | null;
    organizationId: string;
    allowBoardMemberFill?: boolean;
  };
  categories: NpSeedCategory[];
  responses: Record<string, NpAnswerValue>;
  notes?: Record<string, string>;
  answeredCount: number;
  totalQuestions: number;
};

export function AssessmentWizardClient({
  organizationId,
  assessmentId,
  organizationIsDemoTenant = false,
}: {
  organizationId: string;
  assessmentId: string;
  /** Demo orgs may submit with unanswered items (server-enforced); live orgs require 100% completion. */
  organizationIsDemoTenant?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceJson | null>(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [localResponses, setLocalResponses] = useState<Record<string, NpAnswerValue>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/organizations/${organizationId}/np-assessments/${assessmentId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const j = (await r.json()) as WorkspaceJson & { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setWorkspace(j);
      setLocalResponses(j.responses ?? {});
      setNotes(j.notes ?? {});
      setCategoryIndex(Math.min(j.assessment.currentCategoryIndex ?? 0, Math.max(0, j.categories.length - 1)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = workspace?.categories ?? [];
  const current = categories[categoryIndex];
  const totalQs = workspace?.totalQuestions ?? 0;
  const answeredCount = useMemo(() => {
    const codes = new Set<string>();
    categories.forEach((c) => c.questions.forEach((q) => codes.add(q.code)));
    return [...codes].filter((code) => localResponses[code] != null).length;
  }, [categories, localResponses]);

  const flushSave = useCallback(
    async (codesInSection: string[]) => {
      if (!workspace) return;
      if (workspace.assessment.status === "COMPLETED" || workspace.assessment.status === "SUBMITTED") return;
      const items = codesInSection
        .map((indicatorCode) => {
          const answer = localResponses[indicatorCode];
          if (!answer) return null;
          return {
            indicatorCode,
            answer,
            notes: notes[indicatorCode]?.trim() || null,
          };
        })
        .filter(Boolean) as { indicatorCode: string; answer: NpAnswerValue; notes: string | null }[];
      if (items.length === 0) return;
      setSaving(true);
      try {
        const r = await fetch(
          `/api/organizations/${organizationId}/np-assessments/${assessmentId}/responses`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          },
        );
        const j = (await r.json()) as { error?: string };
        if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
        setLastSaved(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Autosave failed");
      } finally {
        setSaving(false);
      }
    },
    [workspace, organizationId, assessmentId, localResponses, notes],
  );

  const scheduleSaveForCategory = useCallback(
    (cat: NpSeedCategory) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const codes = cat.questions.map((q) => q.code);
      saveTimer.current = setTimeout(() => {
        void flushSave(codes);
      }, 900);
    },
    [flushSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const setAnswer = (code: string, value: NpAnswerValue) => {
    setLocalResponses((prev) => ({ ...prev, [code]: value }));
    if (current) scheduleSaveForCategory(current);
  };

  const setNote = (code: string, value: string) => {
    setNotes((prev) => ({ ...prev, [code]: value }));
    if (current) scheduleSaveForCategory(current);
  };

  const goPrev = async () => {
    if (current) await flushSave(current.questions.map((q) => q.code));
    const next = Math.max(0, categoryIndex - 1);
    setCategoryIndex(next);
    await fetch(`/api/organizations/${organizationId}/np-assessments/${assessmentId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCategoryIndex: next }),
    });
  };

  const goNext = async () => {
    if (current) await flushSave(current.questions.map((q) => q.code));
    const next = Math.min(categories.length - 1, categoryIndex + 1);
    setCategoryIndex(next);
    await fetch(`/api/organizations/${organizationId}/np-assessments/${assessmentId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCategoryIndex: next }),
    });
  };

  const submit = async () => {
    if (!workspace) return;
    if (!organizationIsDemoTenant && answeredCount < totalQs) {
      setError(`Answer all ${totalQs} questions before submitting. Currently ${answeredCount} answered (live organization).`);
      return;
    }
    if (organizationIsDemoTenant && answeredCount < totalQs) {
      const okPartial = window.confirm(
        `Only ${answeredCount} of ${totalQs} questions are answered. Submit anyway? (Allowed for demo organizations only.)`,
      );
      if (!okPartial) return;
    }
    const ok = window.confirm("Submit this assessment? You will not be able to edit answers afterward.");
    if (!ok) return;
    if (current) await flushSave(current.questions.map((q) => q.code));
    try {
      const r = await fetch(`/api/organizations/${organizationId}/np-assessments/${assessmentId}/submit`, {
        method: "POST",
        credentials: "include",
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      router.push(`/assessment/report?assessmentId=${assessmentId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    }
  };

  if (loading) {
    return <p className="text-sm text-stone-600">Loading assessment…</p>;
  }
  if (error && !workspace) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
        {error}
      </div>
    );
  }
  if (!workspace || !current) {
    return <p className="text-sm text-stone-600">No categories found. Run database seed for the assessment catalog.</p>;
  }

  if (workspace.assessment.status === "COMPLETED" || workspace.assessment.status === "SUBMITTED") {
    return (
      <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-6 text-sm text-emerald-950">
        <p className="font-medium">This assessment is already submitted.</p>
        <button
          type="button"
          onClick={() => router.push(`/assessment/report?assessmentId=${assessmentId}`)}
          className="mt-3 text-sm font-semibold text-emerald-900 underline"
        >
          View report
        </button>
      </div>
    );
  }

  const progressPct = totalQs === 0 ? 0 : Math.round((answeredCount / totalQs) * 100);
  const sectionPct =
    current.questions.length === 0
      ? 100
      : Math.round(
          (current.questions.filter((q) => localResponses[q.code] != null).length / current.questions.length) * 100,
        );

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{error}</div>
      ) : null}

      <header className="space-y-2 border-b border-stone-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Organizational assessment</p>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">{workspace.assessment.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
          <span>
            Section {categoryIndex + 1} of {categories.length}
          </span>
          <span>·</span>
          <span>
            Overall {answeredCount}/{totalQs} ({progressPct}%)
          </span>
          <span>·</span>
          <span>Section progress {sectionPct}%</span>
          {saving ? <span className="text-stone-500">Saving…</span> : null}
          {lastSaved && !saving ? (
            <span className="text-stone-500">Saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
          <div
            className="h-full rounded-full bg-[color-mix(in_srgb,var(--accent-color,#6b5344)_85%,white)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <h2 className="font-serif text-lg font-semibold text-stone-900">{current.name}</h2>
        <ul className="mt-6 space-y-8">
          {current.questions.map((q) => (
            <li key={q.code} className="border-b border-stone-100 pb-8 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-stone-900">
                  <span className="mr-2 font-mono text-xs text-stone-500">{q.code}</span>
                  {q.text}
                </p>
                <span className="shrink-0 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-700">
                  {q.rating === "E" ? "Essential" : q.rating === "R" ? "Recommended" : "Additional"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ANSWERS.map((a) => (
                  <label
                    key={a}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      localResponses[q.code] === a
                        ? "border-stone-800 bg-stone-50 ring-1 ring-stone-300"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.code}
                      value={a}
                      checked={localResponses[q.code] === a}
                      onChange={() => setAnswer(q.code, a)}
                      className="h-4 w-4 border-stone-400"
                    />
                    {NP_ANSWER_LABEL[a]}
                  </label>
                ))}
              </div>
              <label className="mt-3 block text-xs font-medium text-stone-600">
                Notes (optional)
                <textarea
                  value={notes[q.code] ?? ""}
                  onChange={(e) => setNote(q.code, e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900"
                  placeholder="Context for your team or advisor…"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          type="button"
          onClick={() => void goPrev()}
          disabled={categoryIndex === 0}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm disabled:opacity-40"
        >
          Back
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {categoryIndex < categories.length - 1 ? (
            <button
              type="button"
              onClick={() => void goNext()}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
            >
              Next section
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!organizationIsDemoTenant && answeredCount < totalQs}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

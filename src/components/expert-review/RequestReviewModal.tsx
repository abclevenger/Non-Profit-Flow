"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  EXPERT_REVIEW_CATEGORY_KEYS,
  EXPERT_REVIEW_CATEGORY_LABEL,
  EXPERT_REVIEW_MODAL_TITLE,
  EXPERT_REVIEW_SUCCESS_MESSAGE,
  type ExpertPriorityKey,
  EXPERT_PRIORITY_LABEL,
  type ExpertReviewCategoryKey,
} from "@/lib/expert-review/constants";
import { useModalLayer } from "@/hooks/useModalLayer";

export type RequestReviewTarget = {
  organizationId: string;
  relatedItemType: string;
  relatedItemId: string;
  relatedItemTitle: string;
  relatedHref?: string;
  organizationName: string;
};

export type RequestReviewModalProps = {
  open: boolean;
  target: RequestReviewTarget | null;
  onClose: () => void;
  onSubmitted: () => void;
};

type SuccessInfo = {
  message: string;
  routedTo?: string;
  emailNote?: string;
};

export function RequestReviewModal({ open, target, onClose, onSubmitted }: RequestReviewModalProps) {
  const titleId = useId();
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  useModalLayer(open && !!target, onClose);

  const [category, setCategory] = useState<ExpertReviewCategoryKey>("GENERAL_COUNSEL");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<ExpertPriorityKey>("STANDARD");
  const [deadline, setDeadline] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    if (!open) {
      setCategory("GENERAL_COUNSEL");
      setSubject("");
      setSummary("");
      setPriority("STANDARD");
      setDeadline("");
      setAdditionalNotes("");
      setFormError(null);
      setSuccessInfo(null);
      setSubmitting(false);
    } else if (target) {
      setSubject(target.relatedItemTitle.slice(0, 500));
    }
  }, [open, target]);

  useEffect(() => {
    if (open && target && !successInfo) {
      const t = window.setTimeout(() => categorySelectRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, target, successInfo]);

  const submit = useCallback(async () => {
    if (!target) return;
    setSubmitting(true);
    setFormError(null);
    setSuccessInfo(null);
    try {
      const res = await fetch("/api/expert-review-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: target.organizationId,
          category,
          subject,
          summary,
          priority,
          deadline: deadline.trim() || undefined,
          additionalNotes: additionalNotes.trim() || undefined,
          relatedItemType: target.relatedItemType,
          relatedItemId: target.relatedItemId,
          relatedItemTitle: target.relatedItemTitle,
          relatedHref: target.relatedHref,
          organizationName: target.organizationName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not submit");
      }
      const routed = typeof data.routedToEmail === "string" ? data.routedToEmail.trim() : "";
      const emailSent = data.emailSent === true;
      const warn = typeof data.warning === "string" ? data.warning : null;
      const msg =
        typeof data.message === "string" && data.message
          ? data.message
          : EXPERT_REVIEW_SUCCESS_MESSAGE;
      setSuccessInfo({
        message: msg,
        routedTo: routed || undefined,
        emailNote: emailSent ? undefined : warn || undefined,
      });
      onSubmitted();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [
    target,
    category,
    subject,
    summary,
    priority,
    deadline,
    additionalNotes,
    onSubmitted,
  ]);

  if (!open || !target) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onPointerDown={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[min(92vh,760px)] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-stone-200/90 bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-xl font-semibold text-stone-900">
            {EXPERT_REVIEW_MODAL_TITLE}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-1 shrink-0 rounded-lg p-2 text-stone-500 outline-none ring-stone-400 hover:bg-stone-100 hover:text-stone-800 focus-visible:ring-2"
            aria-label="Close"
          >
            <span aria-hidden className="block text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <p className="mt-2 text-sm text-stone-600">
          Related item: <span className="font-medium text-stone-800">{target.relatedItemTitle}</span>
        </p>

        {successInfo ? (
          <div
            className="mt-6 rounded-xl bg-emerald-50/90 p-5 ring-1 ring-emerald-200/80"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-emerald-950">You&apos;re all set</p>
            <p className="mt-2 text-sm text-emerald-900">{successInfo.message}</p>
            {successInfo.routedTo ? (
              <p className="mt-3 text-sm text-emerald-900">
                <span className="font-medium text-emerald-950">Routed to:</span> {successInfo.routedTo}
              </p>
            ) : null}
            {successInfo.emailNote ? (
              <p className="mt-2 text-sm text-amber-900">{successInfo.emailNote}</p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto"
              style={{ backgroundColor: "var(--demo-accent, #6b5344)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Request category</span>
                <select
                  ref={categorySelectRef}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpertReviewCategoryKey)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                >
                  {EXPERT_REVIEW_CATEGORY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {EXPERT_REVIEW_CATEGORY_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Subject / issue title</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  What needs clarification?
                </span>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                  placeholder="Plain language is best."
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ExpertPriorityKey)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                >
                  {(Object.keys(EXPERT_PRIORITY_LABEL) as ExpertPriorityKey[]).map((k) => (
                    <option key={k} value={k}>
                      {EXPERT_PRIORITY_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Related deadline (optional)
                </span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Additional notes (optional)
                </span>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                />
              </label>
            </div>

            {formError ? (
              <p className="mt-4 text-sm text-rose-700" role="alert" aria-live="assertive">
                {formError}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-200/90 px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !subject.trim() || !summary.trim()}
                onClick={() => void submit()}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                style={{ backgroundColor: "var(--demo-accent, #6b5344)" }}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  GC_MODAL_TITLE,
  GC_URGENCY_LABEL,
  type GcItemType,
  type GcUrgencyKey,
} from "@/lib/gc-review/constants";
import { useModalLayer } from "@/hooks/useModalLayer";

export type FlagGcTarget = {
  organizationId: string;
  itemType: GcItemType;
  itemId: string;
  itemTitle: string;
};

export type FlagGcReviewModalProps = {
  open: boolean;
  target: FlagGcTarget | null;
  onClose: () => void;
  onSubmitted: () => void;
};

export function FlagGcReviewModal({ open, target, onClose, onSubmitted }: FlagGcReviewModalProps) {
  const titleId = useId();
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  useModalLayer(open && !!target, onClose);

  const [reason, setReason] = useState("");
  const [summaryConcern, setSummaryConcern] = useState("");
  const [urgency, setUrgency] = useState<GcUrgencyKey>("STANDARD");
  const [relatedDeadline, setRelatedDeadline] = useState("");
  const [supportingNotes, setSupportingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedOk, setSubmittedOk] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setSummaryConcern("");
      setUrgency("STANDARD");
      setRelatedDeadline("");
      setSupportingNotes("");
      setFormError(null);
      setSubmitting(false);
      setSubmittedOk(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && target && !submittedOk) {
      const t = window.setTimeout(() => reasonRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, target, submittedOk]);

  const submit = useCallback(async () => {
    if (!target) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/gc-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: target.organizationId,
          itemType: target.itemType,
          itemId: target.itemId,
          itemTitle: target.itemTitle,
          reason,
          summaryConcern,
          urgency,
          relatedDeadline: relatedDeadline.trim() || undefined,
          supportingNotes: supportingNotes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not submit");
      }
      onSubmitted();
      setSubmittedOk(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [target, reason, summaryConcern, urgency, relatedDeadline, supportingNotes, onSubmitted]);

  if (!open || !target) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
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
        className="relative z-10 max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-stone-200/90 bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-xl font-semibold text-stone-900">
            {GC_MODAL_TITLE}
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
          <span className="font-medium text-stone-800">{target.itemTitle}</span>
        </p>

        {submittedOk ? (
          <div
            className="mt-6 rounded-xl bg-violet-50/90 p-5 ring-1 ring-violet-200/80"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-violet-950">Flag recorded</p>
            <p className="mt-2 text-sm text-violet-900">
              Counsel can pick this up from the General Counsel queue. You&apos;ll see status updates on this item.
            </p>
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
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Reason for review</span>
                <textarea
                  ref={reasonRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                  placeholder="What should counsel look at?"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Short summary of concern</span>
                <textarea
                  value={summaryConcern}
                  onChange={(e) => setSummaryConcern(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                  placeholder="Plain language — one or two sentences"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Urgency</span>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as GcUrgencyKey)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                >
                  {(Object.keys(GC_URGENCY_LABEL) as GcUrgencyKey[]).map((k) => (
                    <option key={k} value={k}>
                      {GC_URGENCY_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Related deadline (optional)</span>
                <input
                  type="date"
                  value={relatedDeadline}
                  onChange={(e) => setRelatedDeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Supporting notes (optional)</span>
                <textarea
                  value={supportingNotes}
                  onChange={(e) => setSupportingNotes(e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900 outline-none ring-stone-300 focus:ring-2"
                  placeholder="Context, links, or references"
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
                disabled={submitting || !reason.trim() || !summaryConcern.trim()}
                onClick={() => void submit()}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                style={{ backgroundColor: "var(--demo-accent, #6b5344)" }}
              >
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

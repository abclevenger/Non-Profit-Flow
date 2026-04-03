"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EXPERT_REVIEW_CATEGORY_LABEL,
  EXPERT_REVIEW_CATEGORY_KEYS,
  type ExpertReviewCategoryKey,
  ISSUE_ROUTING_SETTINGS_TITLE,
} from "@/lib/expert-review/constants";
import type { IssueRoutingRuleJson } from "@/lib/expert-review/serialize";
import { useWorkspace } from "@/lib/workspace-context";

export default function IssueRoutingSettingsPage() {
  const { organizationId } = useWorkspace();
  const [rules, setRules] = useState<IssueRoutingRuleJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!organizationId) {
      setRules([]);
      setLoading(false);
      setError("Select an organization in the header to edit routing.");
      return;
    }
    try {
      const res = await fetch(
        `/api/issue-routing-rules?organizationId=${encodeURIComponent(organizationId)}`,
      );
      if (!res.ok) throw new Error("Failed to load rules");
      const data = (await res.json()) as { rules: IssueRoutingRuleJson[] };
      setRules(data.rules);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateRule = (category: ExpertReviewCategoryKey, patch: Partial<IssueRoutingRuleJson>) => {
    setRules((prev) =>
      prev.map((r) => (r.category === category ? { ...r, ...patch, category } : r)),
    );
  };

  const save = async () => {
    if (!organizationId) {
      setError("Select an organization in the header before saving.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/issue-routing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          rules: rules.map((r) => ({
            category: r.category,
            displayName: r.displayName,
            destinationEmail: r.destinationEmail,
            fallbackEmail: r.fallbackEmail,
            isActive: r.isActive,
            notes: r.notes,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      setRules(data.rules ?? rules);
      setMessage("Routing settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const byCat = new Map(rules.map((r) => [r.category, r]));
  const merged = EXPERT_REVIEW_CATEGORY_KEYS.map((k) => {
    const r = byCat.get(k);
    return (
      r ?? {
        id: k,
        organizationId: organizationId ?? "",
        category: k,
        displayName: EXPERT_REVIEW_CATEGORY_LABEL[k],
        destinationEmail: "",
        isActive: true,
        fallbackEmail: null,
        notes: null,
        updatedAt: new Date().toISOString(),
      }
    );
  });

  return (
    <div className="space-y-8 pb-16">
      <div>
        <Link href="/overview" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          Back to overview
        </Link>
      </div>
      <header>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">{ISSUE_ROUTING_SETTINGS_TITLE}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Requests will be emailed to the address configured for each category.
        </p>
      </header>

      {loading ? <p className="text-sm text-stone-500">Loading…</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-800">{message}</p> : null}

      <div className="space-y-4">
        {merged.map((r) => (
          <div
            key={r.category}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ring-1 ring-stone-100/80"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-lg font-semibold text-stone-900">{r.displayName}</p>
                <p className="text-xs text-stone-500">{r.category}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={r.isActive}
                  onChange={(e) => updateRule(r.category, { isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300"
                />
                Active
              </label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
                Destination email
                <input
                  type="email"
                  value={r.destinationEmail}
                  onChange={(e) => updateRule(r.category, { destinationEmail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200/90 px-3 py-2 text-sm font-normal text-stone-900"
                  placeholder="name@organization.org"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
                Fallback email (optional)
                <input
                  type="email"
                  value={r.fallbackEmail ?? ""}
                  onChange={(e) =>
                    updateRule(r.category, { fallbackEmail: e.target.value.trim() || null })
                  }
                  className="mt-1 w-full rounded-lg border border-stone-200/90 px-3 py-2 text-sm font-normal text-stone-900"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-stone-500">
              Internal notes (optional)
              <textarea
                value={r.notes ?? ""}
                onChange={(e) => updateRule(r.category, { notes: e.target.value || null })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-200/90 px-3 py-2 text-sm text-stone-900"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving || loading}
        onClick={() => void save()}
        className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
        style={{ backgroundColor: "var(--demo-accent, #6b5344)" }}
      >
        {saving ? "Saving…" : "Save Routing Settings"}
      </button>
    </div>
  );
}

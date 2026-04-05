"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AgencyCreateNonprofitForm({ agencyId }: { agencyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [mission, setMission] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(`/api/agencies/${agencyId}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug: slug.trim() || undefined, missionSnippet: mission || undefined }),
      });
      const j = (await r.json()) as { error?: string; id?: string };
      if (!r.ok) {
        setErr(j.error ?? "Failed to create");
        return;
      }
      router.push(`/agency/${agencyId}/accounts`);
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-stone-500" htmlFor="np-name">
          Nonprofit name
        </label>
        <input
          id="np-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-stone-500" htmlFor="np-slug">
          URL slug (optional)
        </label>
        <input
          id="np-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated if empty"
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-stone-500" htmlFor="np-mission">
          Mission snippet (optional)
        </label>
        <textarea
          id="np-mission"
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
      </div>
      {err ? <p className="text-sm text-rose-700">{err}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
      >
        {loading ? "Creating…" : "Create nonprofit account"}
      </button>
    </form>
  );
}

"use client";

import { useCallback, useState } from "react";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  demoProfileKey: string | null;
  useSupabaseTenantData: boolean;
};

export function PlatformDemoResetPanel({ organizations }: { organizations: OrgRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(async (organizationId: string) => {
    setBusyId(organizationId);
    setMessage(null);
    setError(null);
    try {
      const r = await fetch(`/api/platform-admin/demo-tenants/${organizationId}/reset`, {
        method: "POST",
        credentials: "include",
      });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
      setMessage("Demo tenant re-seeded from its profile template.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (organizations.length === 0) {
    return (
      <p className="rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
        No demo organizations found in the database.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-stone-900">Reset demo tenant data</h2>
      <p className="mt-1 text-sm text-stone-600">
        Reloads Supabase tenant tables from the bundled profile for each org&apos;s{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">demoProfileKey</code>. Prisma branding and flags are
        unchanged.
      </p>
      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
      ) : null}
      <ul className="mt-4 divide-y divide-stone-100">
        {organizations.map((o) => (
          <li key={o.id} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-stone-900">{o.name}</p>
              <p className="text-xs text-stone-500">
                {o.slug} · template {o.demoProfileKey ?? "communityNonprofit"}
                {o.useSupabaseTenantData ? " · Supabase tenant" : " · mock bundle"}
              </p>
            </div>
            <button
              type="button"
              disabled={busyId !== null}
              onClick={() => void reset(o.id)}
              className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:bg-stone-100 disabled:opacity-50"
            >
              {busyId === o.id ? "Resetting…" : "Reset to seeded baseline"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

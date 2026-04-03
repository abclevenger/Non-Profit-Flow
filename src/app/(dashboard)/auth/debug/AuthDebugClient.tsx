"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Health = Record<string, unknown>;

export function AuthDebugClient() {
  const [health, setHealth] = useState<Health | null>(null);
  const [me, setMe] = useState<unknown>(null);
  const [supaUser, setSupaUser] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/supabase/health", { cache: "no-store" })
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ error: "health fetch failed" }));

    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ error: "me fetch failed" }));

    try {
      const sb = createBrowserSupabaseClient();
      void sb.auth.getUser().then(({ data, error }) => {
        if (error) setErr(error.message);
        else setSupaUser(data.user?.email ?? data.user?.id ?? "signed in (no email)");
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Browser Supabase client unavailable");
    }
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Client Supabase user</h2>
        {err ? <p className="mt-2 text-sm text-rose-700">{err}</p> : null}
        <p className="mt-2 break-all font-mono text-xs text-stone-800">{supaUser ?? "Loading…"}</p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">GET /api/auth/me (JSON)</h2>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-stone-100 p-3 text-xs text-stone-800">
          {JSON.stringify(me, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">GET /api/supabase/health (JSON)</h2>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-stone-100 p-3 text-xs text-stone-800">
          {JSON.stringify(health, null, 2)}
        </pre>
      </section>
    </div>
  );
}

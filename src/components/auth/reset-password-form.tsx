"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validatePasswordStrength } from "@/lib/password-policy";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [sessionReady, setSessionReady] = useState<"unknown" | "yes" | "no">("unknown");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = createBrowserSupabaseClient();
        const { data } = await sb.auth.getSession();
        if (!cancelled) setSessionReady(data.session ? "yes" : "no");
      } catch {
        if (!cancelled) setSessionReady("no");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      setError("Password does not meet requirements");
      setDetails(strength.errors);
      return;
    }
    setPending(true);
    try {
      const sb = createBrowserSupabaseClient();
      const { error: upErr } = await sb.auth.updateUser({ password });
      if (upErr) {
        setError(upErr.message || "Could not update password.");
        setPending(false);
        return;
      }
      await sb.auth.signOut();
      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setPending(false);
    }
  }

  if (sessionReady === "unknown") {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-stone-600 shadow-sm ring-1 ring-stone-100">
        <p className="text-sm">Checking your reset link…</p>
      </div>
    );
  }

  if (sessionReady === "no") {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-stone-600 shadow-sm ring-1 ring-stone-100">
        <p className="text-sm">
          This page works after you open the password reset link from your email. If the link expired, request a new
          one.
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block font-semibold text-stone-800 underline">
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Choose a new password</h1>
      <p className="mt-2 text-sm text-stone-600">
        Signed in for this reset only. After saving, sign in again with your new password.
      </p>
      {error ? (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80">
          <p>{error}</p>
          {details.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 shadow-sm outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

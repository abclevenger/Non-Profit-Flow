"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validatePasswordStrength } from "@/lib/password-policy";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/** Wait for HttpOnly session cookies after redirect from /auth/callback (same pattern as login). */
async function waitForRecoverySession(maxMs = 12000): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  let delay = 80;
  while (Date.now() < deadline) {
    try {
      const sb = createBrowserSupabaseClient();
      const { data } = await sb.auth.getSession();
      if (data.session) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(Math.round(delay * 1.5), 800);
  }
  return false;
}

function mapUpdatePasswordError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("session") && (m.includes("expired") || m.includes("invalid"))) {
    return "This reset link is no longer valid. Request a new one from Forgot password.";
  }
  if (m.includes("same password")) {
    return "Choose a different password than your current one.";
  }
  return message;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [sessionReady, setSessionReady] = useState<"unknown" | "yes" | "no">("unknown");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await waitForRecoverySession();
      if (!cancelled) setSessionReady(ok ? "yes" : "no");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
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
        setError(mapUpdatePasswordError(upErr.message));
        setPending(false);
        return;
      }

      const sync = await fetch("/api/auth/sync-prisma-after-password-reset", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (!sync.ok) {
        console.warn("[reset-password] Prisma sync failed after password update", await sync.text());
        /* Password already changed in Supabase — continue; getAppAuth will reconcile on next sign-in. */
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
        <p className="text-sm" role="status" aria-live="polite">
          Verifying your reset link…
        </p>
      </div>
    );
  }

  if (sessionReady === "no") {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-stone-600 shadow-sm ring-1 ring-stone-100">
        <p className="text-sm">
          We couldn&apos;t start a password reset session. The link may have expired or already been used. Request a new
          link below.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block font-semibold text-stone-800 underline-offset-4 hover:underline"
        >
          Forgot password
        </Link>
        <p className="mt-4 text-sm">
          <Link href="/login" className="font-medium text-stone-700 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Set a new password</h1>
      <p className="mt-2 text-sm text-stone-600">
        Choose a strong password you don&apos;t use elsewhere. After saving, you&apos;ll sign in again with this
        password.
      </p>
      {error ? (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
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
      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 shadow-sm outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold uppercase tracking-wide text-stone-500"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

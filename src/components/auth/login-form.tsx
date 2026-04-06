"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  clearPendingAuthPersist,
  setAuthPersistTierCookie,
  setPendingAuthPersist,
} from "@/lib/auth/auth-persist-tier";
import {
  clearOauthTrustIntent,
  clearTrustedDeviceMarker,
  setOauthTrustIntent,
  writeTrustedDeviceMarker,
} from "@/lib/auth/trusted-device";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/** Ensures Supabase cookies are visible to same-origin `/api/auth/me` before hard-navigating to post-signin. */
async function waitForServerSession(maxMs = 4000): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  let delay = 60;
  while (Date.now() < deadline) {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const j = (await r.json()) as { user?: { id?: string } | null };
      if (j?.user && typeof j.user === "object" && j.user.id) {
        return true;
      }
    } catch {
      /* retry */
    }
    await new Promise((res) => setTimeout(res, delay));
    delay = Math.min(Math.round(delay * 1.65), 500);
  }
  return false;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: "Sign-in with LinkedIn did not complete. Try again or use email and password.",
  missing_code: "Sign-in link was incomplete. Try again.",
  config: "Authentication is not configured.",
  db_env:
    "The server cannot see `DATABASE_URL` (and Prisma needs `DIRECT_URL` too). Local: add both next to `package.json` in `.env` or `.env.local`, then restart the dev server. Deployed: Vercel → Project → Settings → Environment Variables — set them for Preview and Production, then redeploy.",
  db_connect:
    "Could not open a database connection (wrong URL, paused Supabase project, firewall, or IPv6-only host from Vercel — try Supabase IPv4 pooler add-on, or confirm `DATABASE_URL` / `DIRECT_URL` match the Supabase dashboard).",
  db_pool:
    "The database refused the connection (pool exhausted or too many Prisma clients). On Vercel, ensure a single Prisma client is reused (singleton); on Supabase, check connection limits and pooler mode (`pgbouncer=true` on `DATABASE_URL`).",
  db_schema:
    "The database exists but tables or columns are missing or out of date. Locally: stop the dev server, run `npx prisma db push`, then `npm run db:seed`. On a hosted DB: run `npx prisma migrate deploy` (or `db push`) against that database, then redeploy.",
  auth_backend:
    "We could not load your account after sign-in (database or app error). Check deployment logs for the real stack trace — it is often a data constraint or Prisma error, not a dead database.",
};

function mapSupabaseSignInError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email before signing in. Check your inbox or contact your administrator.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }
  return message;
}

function useAuthTrace() {
  const dev = process.env.NODE_ENV === "development";
  return useCallback(
    (...args: unknown[]) => {
      if (dev) console.log("[auth:trace]", ...args);
    },
    [dev],
  );
}

export function LoginForm() {
  const trace = useAuthTrace();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/overview";
  const urlError = searchParams.get("error");
  const resetOk = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  async function signInWithLinkedIn() {
    setError(null);
    setOauthPending(true);
    setOauthTrustIntent(trustDevice);
    try {
      const sb = createBrowserSupabaseClient();
      const safeNext = callbackUrl.startsWith("/") ? callbackUrl : "/overview";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}&td=${trustDevice ? "1" : "0"}`;
      const { error: err } = await sb.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: { redirectTo },
      });
      if (err) {
        clearOauthTrustIntent();
        setError(err.message);
        setOauthPending(false);
      }
    } catch (caught) {
      clearOauthTrustIntent();
      setError(caught instanceof Error ? caught.message : "LinkedIn sign-in failed.");
      setOauthPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearOauthTrustIntent();
    setError(null);
    setPending(true);
    const normalized = email.trim().toLowerCase();
    const pwd = password;
    if (!normalized || !pwd) {
      setError("Enter your email and password.");
      setPending(false);
      return;
    }
    try {
      setPendingAuthPersist(trustDevice);
      const sb = createBrowserSupabaseClient();
      const { error: err } = await sb.auth.signInWithPassword({ email: normalized, password: pwd });
      if (err) {
        clearPendingAuthPersist();
        setError(mapSupabaseSignInError(err.message));
        setPending(false);
        return;
      }
      setAuthPersistTierCookie(trustDevice);
      clearPendingAuthPersist();
      if (trustDevice) {
        writeTrustedDeviceMarker();
      } else {
        clearTrustedDeviceMarker();
      }
      await sb.auth.getSession();
      const serverReady = await waitForServerSession(5000);
      trace("password sign-in ok, /api/auth/me ready=", serverReady);
      const safeNext =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/overview";
      window.location.assign(
        `${window.location.origin}/auth/post-signin?next=${encodeURIComponent(safeNext)}`,
      );
    } catch (caught) {
      clearPendingAuthPersist();
      setError(caught instanceof Error ? caught.message : "Sign-in failed.");
      setPending(false);
    }
  }

  return (
    <div className="relative isolate z-[1] overflow-visible rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Image
          src="/govflow-logo.png"
          alt=""
          width={112}
          height={132}
          className="h-[4.5rem] w-auto object-contain"
          priority
        />
        <p className="font-serif text-lg font-semibold text-stone-900">Non-Profit Flow</p>
      </div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Sign in</h1>
      <p className="mt-2 text-sm text-stone-600">
        Use the email and password for your account. If you are on a personal device, keep{" "}
        <span className="font-medium text-stone-800">Trust this device</span> on to stay signed in longer. Use{" "}
        <Link href="/forgot-password" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Forgot password
        </Link>{" "}
        if you need to reset it.
      </p>

      {resetOk ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950 ring-1 ring-emerald-200/80">
          Your password was updated. Sign in with your new password.
        </p>
      ) : null}

      {error || urlError ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
          {error ?? (urlError ? AUTH_ERROR_MESSAGES[urlError] ?? urlError : "")}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-200 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-200 focus:ring-2"
          />
        </div>
        <TrustDeviceCheckbox
          id="trust-device"
          checked={trustDevice}
          onCheckedChange={setTrustDevice}
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-stone-200" />
        </div>
        <p className="relative bg-white text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
          <span className="px-2">Or</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => void signInWithLinkedIn()}
        disabled={oauthPending || pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-60"
      >
        <LinkedInGlyph />
        {oauthPending ? "Redirecting…" : "Continue with LinkedIn"}
      </button>

      <p className="mt-6 text-center text-sm text-stone-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-4 flex flex-col gap-2 text-center text-sm text-stone-600">
        <Link href="/" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function TrustDeviceCheckbox({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-stone-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900"
      />
      <span>
        <span className="font-medium text-stone-900">Trust this device for 30 days</span>
        <span className="mt-0.5 block text-xs text-stone-500">
          Longer sign-in cookies on this browser. Turn off on shared computers for a shorter session.
        </span>
      </span>
    </label>
  );
}

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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

const RESEND_COOLDOWN_SEC = 60;

const LOGIN_OTP_DRAFT_KEY = "npf-login-otp-draft";
const OTP_DRAFT_MAX_AGE_MS = 15 * 60 * 1000;

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

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: "Sign-in with LinkedIn did not complete. Try again or use email code.",
  missing_code: "Sign-in link was incomplete. Try again.",
  config: "Authentication is not configured.",
  db_env:
    "The server cannot see `DATABASE_URL` (and Prisma needs `DIRECT_URL` too). Local: add both next to `package.json` in `.env` or `.env.local`, then restart the dev server. Deployed: Vercel → Project → Settings → Environment Variables — set them for Preview and Production, then redeploy. `DISABLE_APP_AUTH` does not remove the need for a database URL.",
  db_connect:
    "Could not open a database connection (wrong URL, paused Supabase project, firewall, or IPv6-only host from Vercel — try Supabase IPv4 pooler add-on, or confirm `DATABASE_URL` / `DIRECT_URL` match the Supabase dashboard).",
  db_pool:
    "The database refused the connection (pool exhausted or too many Prisma clients). On Vercel, ensure a single Prisma client is reused (singleton); on Supabase, check connection limits and pooler mode (`pgbouncer=true` on `DATABASE_URL`).",
  db_schema:
    "The database exists but tables or columns are missing or out of date. Locally: stop the dev server, run `npx prisma db push`, then `npm run db:seed`. On a hosted DB: run `npx prisma migrate deploy` (or `db push`) against that database, then redeploy.",
  auth_backend:
    "We could not load your account after sign-in (database or app error). Check deployment logs for the real stack trace — it is often a data constraint or Prisma error, not a dead database.",
  dev_login: "Dev sign-in failed. See server logs.",
  dev_login_disabled: "Dev login API is disabled.",
  dev_login_supabase: "Supabase URL/anon key missing for dev login.",
  dev_login_service_role: "Add SUPABASE_SERVICE_ROLE_KEY for dev or seeded-password sign-in.",
  dev_login_email: "This email is not allowed for dev login.",
  dev_login_prisma_user: "No Prisma user for this email — run npm run db:seed.",
  dev_login_link: "Could not issue Supabase magic link (service role / Auth settings).",
  dev_login_verify: "Could not verify dev sign-in with Supabase.",
};

function useAuthTrace() {
  const dev = process.env.NODE_ENV === "development";
  return useCallback(
    (...args: unknown[]) => {
      if (dev) console.log("[auth:trace]", ...args);
    },
    [dev],
  );
}

/** Document capture-phase pointer logging — proves which node is hit and whether something sits above the button. */
function useLoginPointerDebug(enabled: boolean, trace: (...args: unknown[]) => void) {
  useEffect(() => {
    if (!enabled) return;
    const cap = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      const x = ev.clientX;
      const y = ev.clientY;
      const topEl = document.elementFromPoint(x, y);
      const path = ev.composedPath();
      const pathStr = path
        .slice(0, 14)
        .map((n) => {
          if (!(n instanceof Element)) {
            return (n as object)?.constructor?.name ?? String(n);
          }
          const tag = n.tagName.toLowerCase();
          const id = n.id ? `#${n.id}` : "";
          let cls = "";
          if (typeof (n as HTMLElement).className === "string") {
            const parts = (n as HTMLElement).className.trim().split(/\s+/).filter(Boolean).slice(0, 4);
            cls = parts.length ? `.${parts.join(".")}` : "";
          }
          return `${tag}${id}${cls}`;
        })
        .join(" | ");
      let hit: Record<string, string> = {};
      if (topEl instanceof HTMLElement) {
        const cs = window.getComputedStyle(topEl);
        hit = {
          pointerEvents: cs.pointerEvents,
          opacity: cs.opacity,
          position: cs.position,
          zIndex: cs.zIndex,
        };
      }
      trace("[pointer-debug:capture]", {
        targetTag: ev.target instanceof Element ? ev.target.tagName : String(ev.target),
        elementFromPoint:
          topEl instanceof Element ? `${topEl.tagName}${topEl.id ? `#${topEl.id}` : ""}` : String(topEl),
        ...hit,
        composedPath: pathStr,
      });
    };
    document.addEventListener("pointerdown", cap, true);
    trace("[pointer-debug] installed document capture listener (see [pointer-debug:capture] on click)");
    return () => document.removeEventListener("pointerdown", cap, true);
  }, [enabled, trace]);
}

export function LoginForm() {
  const trace = useAuthTrace();
  useLoginPointerDebug(process.env.NODE_ENV === "development", trace);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/overview";
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const [trustDevice, setTrustDevice] = useState(true);
  const [password, setPassword] = useState("");

  const resendCooldownActive = resendCooldownSec > 0;
  useEffect(() => {
    if (!resendCooldownActive) return;
    const id = window.setInterval(() => {
      setResendCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldownActive]);

  /** Restore OTP step after refresh (e.g. auth listener) so the code form does not disappear mid-flow. */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LOGIN_OTP_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { email?: string; at?: number };
      if (typeof parsed.email !== "string" || !parsed.email) return;
      if (Date.now() - (parsed.at ?? 0) > OTP_DRAFT_MAX_AGE_MS) {
        sessionStorage.removeItem(LOGIN_OTP_DRAFT_KEY);
        return;
      }
      setEmail(parsed.email);
      setStep("otp");
    } catch {
      /* ignore */
    }
  }, []);

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

  async function sendOtpFlow() {
    setError(null);
    setResendHint(null);
    setPending(true);
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setPending(false);
      return;
    }
    try {
      trace("sendOtp start", { email: normalized, origin: window.location.origin });
      const sb = createBrowserSupabaseClient();
      const safeNext = callbackUrl.startsWith("/") ? callbackUrl : "/overview";
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}&td=${trustDevice ? "1" : "0"}`;
      trace("sendOtp emailRedirectTo", emailRedirectTo);
      const { error: err } = await sb.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          emailRedirectTo,
        },
      });
      if (err) {
        trace("sendOtp supabase error", err.message, err);
        setError(err.message);
        setPending(false);
        return;
      }
      trace("sendOtp ok → OTP step");
      clearOauthTrustIntent();
      try {
        sessionStorage.setItem(
          LOGIN_OTP_DRAFT_KEY,
          JSON.stringify({ email: normalized, at: Date.now() }),
        );
      } catch {
        /* private mode */
      }
      setStep("otp");
      setResendHint(null);
      setResendCooldownSec(RESEND_COOLDOWN_SEC);
    } catch (caught) {
      const msg =
        caught instanceof Error ? caught.message : "We could not send a code right now. Please try again in a moment.";
      trace("sendOtp catch", caught);
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  async function signInWithPrismaPassword() {
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
      const safeNext =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/overview";
      const r = await fetch("/api/auth/seeded-password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalized,
          password: pwd,
          next: safeNext,
          trustDevice,
        }),
      });
      const j = (await r.json()) as { ok?: boolean; redirect?: string; error?: string; code?: string };
      if (!r.ok) {
        const hint =
          j.code && OAUTH_ERROR_MESSAGES[j.code] ? OAUTH_ERROR_MESSAGES[j.code] : j.error ?? "Could not sign in";
        setError(hint);
        return;
      }
      if (trustDevice) {
        writeTrustedDeviceMarker();
      } else {
        clearTrustedDeviceMarker();
      }
      const serverReady = await waitForServerSession(5000);
      trace("password sign-in ok, /api/auth/me ready=", serverReady);
      if (j.redirect) {
        window.location.assign(`${window.location.origin}${j.redirect}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  async function resendOtp() {
    setError(null);
    setResendHint(null);
    setPending(true);
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setPending(false);
      return;
    }
    try {
      const sb = createBrowserSupabaseClient();
      const safeNext = callbackUrl.startsWith("/") ? callbackUrl : "/overview";
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}&td=${trustDevice ? "1" : "0"}`;
      trace("resendOtp emailRedirectTo", emailRedirectTo);
      const { error: err } = await sb.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          emailRedirectTo,
        },
      });
      if (err) {
        trace("resendOtp supabase error", err.message);
        setError(err.message);
        return;
      }
      setResendHint("We sent another code to your email.");
      setResendCooldownSec(RESEND_COOLDOWN_SEC);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not resend the code. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    clearOauthTrustIntent();
    setError(null);
    setPending(true);
    const normalized = email.trim().toLowerCase();
    const token = otp.trim().replace(/\s/g, "");
    if (!token) {
      setPending(false);
      return;
    }
    try {
      trace("verifyOtp start", { email: normalized });
      setPendingAuthPersist(trustDevice);
      const sb = createBrowserSupabaseClient();
      const { error: err } = await sb.auth.verifyOtp({
        email: normalized,
        token,
        type: "email",
      });
      if (err) {
        trace("verifyOtp supabase error", err.message);
        clearPendingAuthPersist();
        setError(err.message);
        setPending(false);
        return;
      }
      setAuthPersistTierCookie(trustDevice);
      clearPendingAuthPersist();
      // Apply trust marker before any further await so onAuthStateChange → fetchSession
      // does not treat an old expired marker as “sign out” during this sign-in.
      if (trustDevice) {
        writeTrustedDeviceMarker();
      } else {
        clearTrustedDeviceMarker();
      }
      await sb.auth.getSession();
      const serverReady = await waitForServerSession(5000);
      trace("verifyOtp ok, /api/auth/me ready=", serverReady);
      if (!serverReady) {
        trace("verifyOtp: navigating anyway — cookies may still apply on full navigation");
      }
      try {
        sessionStorage.removeItem(LOGIN_OTP_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      const safeNext =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/overview";
      // Full navigation so Supabase cookies are always attached to the post-signin request
      // (client router transitions can race session persistence).
      window.location.assign(
        `${window.location.origin}/auth/post-signin?next=${encodeURIComponent(safeNext)}`,
      );
    } catch (caught) {
      clearPendingAuthPersist();
      const msg = caught instanceof Error ? caught.message : "Verification failed.";
      trace("verifyOtp catch", caught);
      setError(msg);
    } finally {
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
        {step === "email" ? (
          trustDevice ? (
            <>
              With <span className="font-medium text-stone-800">Trust this device</span> on, sign in with your email and
              password — we won&apos;t email a code or magic link. Uncheck it if you prefer a one-time code (better on
              shared computers). If you&apos;re already signed in here, we&apos;ll open the app.
            </>
          ) : (
            <>
              We&apos;ll send a <span className="font-medium text-stone-800">one-time code</span> (or a link in the same
              email). No password on this path. Check <span className="font-medium text-stone-800">Trust this device</span>{" "}
              above if you want to use your password instead.
            </>
          )
        ) : (
          <>Enter the code we sent to {email.trim().toLowerCase()}.</>
        )}
      </p>

      {error || urlError ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
          {error ?? (urlError ? OAUTH_ERROR_MESSAGES[urlError] ?? urlError : "")}
        </p>
      ) : null}

      {step === "otp" ? (
        <div className="mt-4 space-y-3 rounded-lg bg-stone-50/90 px-3 py-3 text-sm text-stone-600 ring-1 ring-stone-200/80">
          <p>
            Most codes arrive within a minute. If you don&apos;t see it, check your <span className="font-medium text-stone-800">spam</span> or{" "}
            <span className="font-medium text-stone-800">promotions</span> folder.
          </p>
          <p className="text-stone-500">
            Wrong address? Use <span className="font-medium text-stone-700">Use a different email</span> below.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-200/80 pt-3">
            <button
              type="button"
              onClick={() => void resendOtp()}
              disabled={pending || resendCooldownSec > 0}
              className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
            >
              {pending
                ? "Sending…"
                : resendCooldownSec > 0
                  ? `Resend code in ${resendCooldownSec}s`
                  : "Resend code"}
            </button>
            <span className="text-stone-400" aria-hidden>
              ·
            </span>
            <a
              href="https://www.mission-impact.legal/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline"
            >
              Contact support
            </a>
          </div>
          {resendHint ? (
            <p className="text-sm font-medium text-emerald-800" role="status">
              {resendHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === "email" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void (trustDevice ? signInWithPrismaPassword() : sendOtpFlow());
          }}
          className="mt-6 space-y-4"
        >
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
          <TrustDeviceCheckbox
            id="trust-device-email"
            checked={trustDevice}
            onCheckedChange={(v) => {
              setTrustDevice(v);
              if (!v) setPassword("");
            }}
          />
          {trustDevice ? (
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
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (trustDevice ? "Signing in…" : "Sending…") : trustDevice ? "Sign in with password" : "Send code"}
          </button>

          <div className="relative py-2">
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

        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-6 space-y-4">
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              One-time code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-200 focus:ring-2"
            />
          </div>
          <TrustDeviceCheckbox
            id="trust-device-otp"
            checked={trustDevice}
            onCheckedChange={setTrustDevice}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify and sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(LOGIN_OTP_DRAFT_KEY);
              } catch {
                /* ignore */
              }
              setStep("email");
              setOtp("");
              setError(null);
              setResendHint(null);
              setResendCooldownSec(0);
            }}
            className="w-full text-sm font-medium text-stone-600 underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-stone-600">
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
          When checked, sign in with your password (we don&apos;t email a code) and cookies can last up to 30 days
          until you sign out or the trust period ends. When unchecked, we email a one-time code and use a shorter
          session — better on shared computers.
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

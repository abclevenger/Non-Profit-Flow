"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  auth_backend:
    "We could not load your account after sign-in. The app database is usually missing, out of date, or unreachable. Locally: stop the dev server, run `npx prisma db push` (add `--force-reset` only if you intend to wipe data), then `npm run db:seed`, and sign in again. On Vercel or other hosts: set `DATABASE_URL` and apply the same Prisma schema (push or migrate) so the User table exists.",
  dev_login:
    "Developer sign-in failed unexpectedly. Check the terminal for [dev-login-bypass] logs. Prefer a normal browser tab at http://localhost:3000 (not only the editor preview) so cookies apply reliably.",
  dev_login_disabled: "Developer sign-in is disabled in this environment (not development and ENABLE_DEV_LOGIN_BYPASS is unset).",
  dev_login_supabase:
    "Developer sign-in needs Supabase: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).",
  dev_login_service_role:
    "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard → Project Settings → API → service_role). Restart the dev server after saving.",
  dev_login_email: "Dev login only allows ashley@ymbs.pro.",
  dev_login_prisma_user:
    "No Prisma user for ashley@ymbs.pro. From the project root run: npx prisma db push && npm run db:seed",
  dev_login_link:
    "Supabase could not issue a magic link for this user (generateLink failed). Check service role key, Supabase Auth logs, and that the email exists in Supabase Auth.",
  dev_login_verify:
    "Session could not be created after the magic link step (verifyOtp failed). Try again; if it persists, confirm anon key matches your Supabase project and redirect URLs include this origin.",
};

function useAuthTrace(showDevLogin: boolean) {
  return useCallback(
    (...args: unknown[]) => {
      if (showDevLogin || process.env.NODE_ENV === "development") {
        console.log("[auth:trace]", ...args);
      }
    },
    [showDevLogin],
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

export function LoginForm({ showDevLogin = false }: { showDevLogin?: boolean }) {
  const trace = useAuthTrace(showDevLogin);
  useLoginPointerDebug(showDevLogin || process.env.NODE_ENV === "development", trace);

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
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
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

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
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
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
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
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
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
      const sb = createBrowserSupabaseClient();
      const { error: err } = await sb.auth.verifyOtp({
        email: normalized,
        token,
        type: "email",
      });
      if (err) {
        trace("verifyOtp supabase error", err.message);
        setError(err.message);
        setPending(false);
        return;
      }
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
        {step === "email"
          ? "Enter your email. We will send a one-time sign-in code (check spam)."
          : `Enter the code sent to ${email.trim().toLowerCase()}.`}
      </p>

      {showDevLogin ? (
        <DevDeveloperSignInSection
          trace={trace}
          safeNext={
            callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/overview"
          }
        />
      ) : null}

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
        <form onSubmit={sendOtp} className="mt-6 space-y-4">
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
            onCheckedChange={setTrustDevice}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send code"}
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

/**
 * Dev bypass: plain <a href> → GET /api/auth/dev-login (302 + Set-Cookie).
 * Root issue when clicks “do nothing”: React onClick/fetch never runs in some embedded/preview browsers;
 * full navigation does not depend on JS handlers. Do not use next/link here (prefetch would hit GET).
 */
function DevDeveloperSignInSection({
  safeNext,
  trace,
}: {
  safeNext: string;
  trace: (...args: unknown[]) => void;
}) {
  const href = `/api/auth/dev-login?next=${encodeURIComponent(safeNext)}`;

  return (
    <div
      className="relative z-[100] mt-6 rounded-xl border border-dashed border-amber-300/90 bg-amber-50/50 px-4 py-4 text-left shadow-sm ring-1 ring-amber-200/60 pointer-events-auto"
      role="region"
      aria-label="Developer sign in"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900/90">Developer sign in</p>
      <p className="mt-1 text-xs text-amber-950/80">
        Uses a real browser navigation (GET + redirect) so sign-in works even when JS click handlers are blocked.
        Same origin as this tab — safe for localhost, LAN IP, and any dev port.
      </p>
      <a
        href={href}
        className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-lg border border-amber-800/30 bg-white px-3 py-2.5 text-center text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-50"
        onPointerDown={() => trace("[dev-login] <a> pointerdown (native)", { href })}
        onClick={() => {
          trace("[dev-login] <a> click (native, before navigation)", {
            href,
            origin: typeof window !== "undefined" ? window.location.origin : "",
          });
          writeTrustedDeviceMarker();
        }}
      >
        Sign in as Ashley
      </a>
      <p className="mt-2 text-[10px] text-amber-900/70">
        POST fallback: same URL with fetch from DevTools if you need JSON + Set-Cookie debugging.
      </p>
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
          Keeps this browser signed in for up to 30 days (session refresh + longer idle timeout). Uncheck on shared
          computers — you&apos;ll sign out sooner when idle.
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

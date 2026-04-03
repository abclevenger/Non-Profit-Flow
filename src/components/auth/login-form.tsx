"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth: "Sign-in with LinkedIn did not complete. Try again or use email code.",
  missing_code: "Sign-in link was incomplete. Try again.",
  config: "Authentication is not configured.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/overview";
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);

  async function signInWithLinkedIn() {
    setError(null);
    setOauthPending(true);
    try {
      const sb = createBrowserSupabaseClient();
      const safeNext = callbackUrl.startsWith("/") ? callbackUrl : "/overview";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
      const { error: err } = await sb.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: { redirectTo },
      });
      if (err) {
        setError(err.message);
        setOauthPending(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "LinkedIn sign-in failed.");
      setOauthPending(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      const { error: err } = await sb.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          emailRedirectTo,
        },
      });
      if (err) {
        setError(err.message);
        setPending(false);
        return;
      }
      setStep("otp");
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Could not reach Supabase. Check environment variables.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const normalized = email.trim().toLowerCase();
    const token = otp.trim().replace(/\s/g, "");
    if (!token) {
      setPending(false);
      return;
    }
    try {
      const sb = createBrowserSupabaseClient();
      const { error: err } = await sb.auth.verifyOtp({
        email: normalized,
        token,
        type: "email",
      });
      if (err) {
        setError(err.message);
        setPending(false);
        return;
      }
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/overview");
      router.refresh();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Verification failed.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
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

      {error || urlError ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
          {error ?? (urlError ? OAUTH_ERROR_MESSAGES[urlError] ?? urlError : "")}
        </p>
      ) : null}

      {step === "otp" && !error && !urlError ? (
        <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200/80">
          No email after a minute? Check spam, then in Supabase open{" "}
          <span className="font-medium text-stone-900">Authentication → Logs</span> for send errors. Under{" "}
          <span className="font-medium text-stone-900">URL configuration</span>, add your app&apos;s{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">/auth/callback</code> URL (e.g.{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">http://localhost:3000/auth/callback</code>
          ) to redirect URLs. The sign-in email template should include the code placeholder{" "}
          <code className="rounded bg-stone-200/80 px-1 py-0.5 text-xs">{"{{ .Token }}"}</code>.
        </p>
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
              setStep("email");
              setOtp("");
              setError(null);
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

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

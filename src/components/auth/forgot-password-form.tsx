"use client";

import Link from "next/link";
import { useState } from "react";

const GENERIC_SUCCESS =
  "If an account exists for this email, you will receive password reset instructions shortly. Check your inbox and spam folder.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(false);
    setPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong. Try again or contact your administrator.");
        setIsSuccess(false);
        return;
      }
      setMessage(data.message ?? GENERIC_SUCCESS);
      setIsSuccess(true);
    } catch {
      setMessage("Something went wrong. Try again or contact your administrator.");
      setIsSuccess(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Forgot password?</h1>
      <p className="mt-2 text-sm text-stone-600">
        Enter your email and we&apos;ll send you a secure link to set a new password. The link expires after a short
        time for your security.
      </p>
      {message ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ring-1 ${
            isSuccess
              ? "bg-emerald-50 text-emerald-950 ring-emerald-200/80"
              : "bg-amber-50 text-amber-950 ring-amber-200/80"
          }`}
          role={isSuccess ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}
      {!isSuccess ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 shadow-sm outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      ) : null}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

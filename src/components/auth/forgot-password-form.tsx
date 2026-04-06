"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
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
        return;
      }
      setMessage(data.message ?? "If an account exists, check your email for next steps.");
    } catch {
      setMessage("Something went wrong. Try again or contact your administrator.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Reset password</h1>
      <p className="mt-2 text-sm text-stone-600">
        We will email you a secure link to choose a new password. If you are locked out, contact another administrator or
        chair for help.
      </p>
      {message ? (
        <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-800 ring-1 ring-stone-200/80">{message}</p>
      ) : null}
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
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type LoginFormProps = {
  hasGoogle: boolean;
  hasMicrosoft: boolean;
};

export function LoginForm({ hasGoogle, hasMicrosoft }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/overview";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        totp: totp.trim() || "",
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Check your email, password, and authenticator code (required for admin accounts with 2FA).");
        setPending(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Sign in</h1>
      <p className="mt-2 text-sm text-stone-600">
        Use your board email. Admin and board chair accounts may require an authenticator code.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" autoComplete="on">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
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
        <div>
          <label htmlFor="totp" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Authenticator code (if prompted)
          </label>
          <input
            id="totp"
            name="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            placeholder="6-digit code"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-200 focus:ring-2"
          />
          <p className="mt-1 text-xs text-stone-500">Works with Google Authenticator, 1Password, Bitwarden, and other TOTP apps.</p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {(hasGoogle || hasMicrosoft) && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-stone-500">Or continue with</p>
          <div className="mt-3 flex flex-col gap-2">
            {hasGoogle ? (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
              >
                Google
              </button>
            ) : null}
            {hasMicrosoft ? (
              <button
                type="button"
                onClick={() => signIn("microsoft-entra-id", { callbackUrl })}
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
              >
                Microsoft
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-stone-600">
        <Link href="/forgot-password" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Create an account
        </Link>
        <p className="text-xs text-stone-500">
          Passwords must be at least 12 characters and include upper, lower, number, and symbol — safe for password managers.
        </p>
      </div>
    </div>
  );
}
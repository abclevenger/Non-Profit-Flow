"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    setPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string; details?: string[] };
      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        if (data.details?.length) setDetails(data.details);
        setPending(false);
        return;
      }
      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setError("Network error");
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
        <p>Missing reset token. Request a new link from the forgot password page.</p>
        <Link href="/forgot-password" className="mt-4 inline-block font-semibold text-stone-800 underline">
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-sm ring-1 ring-stone-100">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Choose a new password</h1>
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
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearPendingAuthPersist,
  setAuthPersistTierCookie,
  setPendingAuthPersist,
} from "@/lib/auth/auth-persist-tier";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * OAuth + email confirmation + password recovery return handler (client-side).
 *
 * Server `route.ts` cannot read URL hash fragments, but Supabase sometimes delivers
 * recovery sessions via hash (implicit) or query `code` (PKCE). This page handles both.
 */

async function waitForSessionFromUrl(
  sb: ReturnType<typeof createBrowserSupabaseClient>,
  maxMs = 4000,
): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  let delay = 80;
  while (Date.now() < deadline) {
    const { data } = await sb.auth.getSession();
    if (data.session) return true;
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(Math.round(delay * 1.45), 500);
  }
  return false;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hint, setHint] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isSupabaseConfigured()) {
        router.replace("/login?error=config");
        return;
      }

      const oauthError = searchParams.get("error");
      if (oauthError) {
        router.replace("/login?error=oauth");
        return;
      }

      const nextParam = searchParams.get("next");
      const next =
        nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";
      const nextPathOnly = (nextParam?.split("?")[0] ?? "").trim();
      const isRecoveryFlow =
        nextPathOnly === "/reset-password" || nextPathOnly.startsWith("/reset-password/");
      const td = searchParams.get("td");
      const longLived = td !== "0" && td !== "false";

      setPendingAuthPersist(longLived);
      const code = searchParams.get("code");

      try {
        const sb = createBrowserSupabaseClient();

        if (code) {
          const { error: exErr } = await sb.auth.exchangeCodeForSession(code);
          if (exErr) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth/callback] exchangeCodeForSession", exErr.message);
            }
            clearPendingAuthPersist();
            const err = isRecoveryFlow ? "reset_session" : "oauth";
            if (!cancelled) router.replace(`/login?error=${err}`);
            return;
          }
          const { data: immediate } = await sb.auth.getSession();
          if (!immediate.session) {
            const recovered = await waitForSessionFromUrl(sb, 3000);
            if (!recovered) {
              clearPendingAuthPersist();
              const err = isRecoveryFlow ? "reset_session" : "oauth";
              if (!cancelled) router.replace(`/login?error=${err}`);
              return;
            }
          }
        } else {
          setHint("Checking your session…");
          const ok = await waitForSessionFromUrl(sb);
          if (!ok) {
            clearPendingAuthPersist();
            const err = isRecoveryFlow ? "reset_session" : "missing_code";
            if (!cancelled) router.replace(`/login?error=${err}`);
            return;
          }
        }

        setAuthPersistTierCookie(longLived);
        clearPendingAuthPersist();

        const nextPathForRedirect = (next.split("?")[0] ?? next).trim() || "/overview";
        const isPasswordRecovery =
          nextPathForRedirect === "/reset-password" || nextPathForRedirect.startsWith("/reset-password/");
        if (isPasswordRecovery) {
          if (!cancelled) router.replace(next.startsWith("/") ? next : `/${next}`);
          return;
        }
        if (!cancelled) {
          router.replace(`/auth/post-signin?next=${encodeURIComponent(next)}`);
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth/callback]", e);
        }
        clearPendingAuthPersist();
        if (!cancelled) router.replace(`/login?error=oauth`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium text-stone-700" role="status" aria-live="polite">
        {hint}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center px-6 py-16 text-sm text-stone-600">
          Loading…
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

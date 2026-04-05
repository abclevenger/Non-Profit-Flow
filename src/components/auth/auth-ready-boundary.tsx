"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth/session-hooks";

/** Post-login /me + cookie hydration can briefly report unauthenticated; wait before hard-nav to /login. */
const UNAUTH_REDIRECT_GRACE_MS = 1800;

function isPublicAuthPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const publicPrefixes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/auth/post-signin",
    "/forbidden",
  ];
  return publicPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Avoids flashing protected UI or racing `/login` before the client has finished reading
 * Supabase cookies + `/api/auth/me`. Middleware refreshes cookies first; this covers the client gap.
 */
export function AuthReadyBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isPublic = isPublicAuthPath(pathname);
  const [unauthRedirectAllowed, setUnauthRedirectAllowed] = useState(false);

  useEffect(() => {
    if (isPublic || status !== "unauthenticated") {
      setUnauthRedirectAllowed(false);
      return;
    }
    const t = window.setTimeout(() => {
      if (process.env.NODE_ENV === "development") {
        console.info("[auth:debug] grace elapsed — treating unauthenticated as final", { pathname });
      }
      setUnauthRedirectAllowed(true);
    }, UNAUTH_REDIRECT_GRACE_MS);
    return () => window.clearTimeout(t);
  }, [isPublic, pathname, status]);

  useEffect(() => {
    if (isPublic || status === "loading" || status === "authenticated") return;
    if (!unauthRedirectAllowed) return;
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    if (process.env.NODE_ENV === "development") {
      console.info("[auth:debug] ready-boundary window.location /login", { pathname });
    }
    window.location.assign(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }, [isPublic, pathname, searchParams, status, unauthRedirectAllowed]);

  if (isPublic) {
    return children;
  }

  const showRestoring = status === "loading" || (status === "unauthenticated" && !unauthRedirectAllowed);

  if (showRestoring) {
    return (
      <div
        className="flex min-h-full flex-col items-center justify-center gap-3 bg-[#f7f5f2] px-6 py-16 text-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-sm font-medium text-stone-700">Restoring your session…</p>
        <p className="max-w-sm text-xs text-stone-500">Checking sign-in on this device. This usually takes a moment.</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div
        className="flex min-h-full flex-col items-center justify-center gap-2 bg-[#f7f5f2] px-6 py-16 text-center text-sm text-stone-600"
        role="status"
        aria-live="polite"
      >
        Redirecting to sign in…
      </div>
    );
  }

  return children;
}

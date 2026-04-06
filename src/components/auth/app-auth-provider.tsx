"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AppSession } from "@/lib/auth/app-session";
import {
  consumeOauthTrustIntent,
  trustedDeviceExpiryRequiresReauth,
  writeTrustedDeviceMarker,
  clearTrustedDeviceMarker,
} from "@/lib/auth/trusted-device";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AppAuthContextValue = {
  session: AppSession | null;
  status: AuthStatus;
  update: (data?: { activeOrganizationId?: string | null; activeAgencyId?: string | null }) => Promise<void>;
};

const AppAuthContext = createContext<AppAuthContextValue | null>(null);

const ME_RETRY_MS = 450;

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const oauthIntentApplied = useRef(false);
  /** Suppress stale results when mount + onAuthStateChange(INITIAL_SESSION) overlap. */
  const fetchSeqRef = useRef(0);
  /** When browser Supabase session exists but /api/auth/me is empty (cookie/Prisma lag), do not log out yet. */
  const meLagRetriesRef = useRef(0);

  const fetchSession = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    if (process.env.NODE_ENV === "development") {
      console.info("[auth:debug] fetchSession start", { seq });
    }
    const apply = (next: { session: AppSession | null; status: AuthStatus }) => {
      if (seq !== fetchSeqRef.current) return;
      if (next.status === "authenticated") {
        meLagRetriesRef.current = 0;
      }
      setSession(next.session);
      setStatus(next.status);
      if (process.env.NODE_ENV === "development") {
        console.info("[auth:debug] state →", next.status, { seq, hasUser: Boolean(next.session?.user) });
      }
    };

    let sb: SupabaseClient | null = null;

    const deferUnauthIfClientSessionExists = async (): Promise<boolean> => {
      if (!sb) return false;
      try {
        const { data: sd } = await sb.auth.getSession();
        if (!sd.session?.user) return false;
        if (meLagRetriesRef.current >= 24) return false;
        meLagRetriesRef.current += 1;
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth:debug] defer unauth (client session, /me empty)", {
            attempt: meLagRetriesRef.current,
            seq,
          });
        }
        window.setTimeout(() => void fetchSession(), 450);
        return true;
      } catch {
        return false;
      }
    };

    try {
      let supabaseHasUser = false;

      try {
        const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
        sb = createBrowserSupabaseClient();

        /**
         * Trusted-device window elapsed (30 days) — end Supabase session so the user must use email code again.
         * Skips wiping a session that never had a trust marker (unchecked “trust” uses short cookies only).
         */
        if (trustedDeviceExpiryRequiresReauth()) {
          clearTrustedDeviceMarker();
          try {
            await sb.auth.signOut();
          } catch {
            /* ignore */
          }
        }

        const { data } = await sb.auth.getSession();
        supabaseHasUser = Boolean(data.session?.user);
        if (process.env.NODE_ENV === "development") {
          console.info("[auth:debug] getSession", { seq, supabaseHasUser });
        }
      } catch {
        /* Supabase env missing */
      }

      let meCalls = 0;
      const readMe = async () => {
        meCalls += 1;
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const j = (await r.json()) as AppSession | { user: null };
        if (process.env.NODE_ENV === "development" && meCalls === 1) {
          console.info("[auth:debug] /api/auth/me first", {
            seq,
            hasUser: Boolean(j && "user" in j && j.user),
          });
        }
        return j;
      };

      let data = await readMe();
      if (data && "user" in data && data.user) {
        apply({ session: data as AppSession, status: "authenticated" });
        return;
      }

      // After /auth/post-signin or dev-login redirect, HttpOnly cookies + /api/auth/me can lag the
      // first client tick; AuthReadyBoundary would send users to /login if we go unauthenticated too soon.
      const pollMs = 120;
      const pollAttempts = 12;
      for (let i = 0; i < pollAttempts; i++) {
        await new Promise((r) => setTimeout(r, pollMs));
        if (sb) {
          try {
            const { data: sd } = await sb.auth.getSession();
            supabaseHasUser = Boolean(sd.session?.user);
            if (supabaseHasUser) {
              await sb.auth.refreshSession().catch(() => {});
            }
          } catch {
            /* ignore */
          }
        }
        data = await readMe();
        if (data && "user" in data && data.user) {
          apply({ session: data as AppSession, status: "authenticated" });
          return;
        }
      }

      if (supabaseHasUser && sb) {
        const { data: refData, error: refErr } = await sb.auth.refreshSession();
        if (process.env.NODE_ENV === "development") {
          console.info("[auth:debug] refreshSession", {
            seq,
            ok: !refErr,
            hasSession: Boolean(refData.session?.user),
          });
        }
        await new Promise((r) => setTimeout(r, ME_RETRY_MS));
        data = await readMe();
        if (data && "user" in data && data.user) {
          apply({ session: data as AppSession, status: "authenticated" });
          return;
        }
        await new Promise((r) => setTimeout(r, ME_RETRY_MS));
        data = await readMe();
        if (data && "user" in data && data.user) {
          apply({ session: data as AppSession, status: "authenticated" });
          return;
        }
      }

      if (await deferUnauthIfClientSessionExists()) return;
      apply({ session: null, status: "unauthenticated" });
    } catch {
      if (await deferUnauthIfClientSessionExists()) return;
      apply({ session: null, status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (status === "unauthenticated") oauthIntentApplied.current = false;
  }, [status]);

  /** After OAuth / magic-link callback, apply “trust device” from sessionStorage. */
  useEffect(() => {
    if (status !== "authenticated" || oauthIntentApplied.current) return;
    const intent = consumeOauthTrustIntent();
    if (intent === null) return;
    oauthIntentApplied.current = true;
    if (intent) {
      writeTrustedDeviceMarker();
    } else {
      clearTrustedDeviceMarker();
    }
  }, [status]);

  /** Mirror Prisma memberships to Supabase for RLS-backed tenant reads (no-op if misconfigured). */
  useEffect(() => {
    if (status !== "authenticated") return;
    void fetch("/api/auth/sync-supabase-membership", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [status]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    void import("@/lib/supabase/browser")
      .then(({ createBrowserSupabaseClient }) => {
        try {
          const sb = createBrowserSupabaseClient();
          const {
            data: { subscription },
          } = sb.auth.onAuthStateChange((event) => {
            void fetchSession();
            // Avoid router.refresh on TOKEN_REFRESHED — it refetches RSC while /api/auth/me can briefly
            // lag cookies and triggers a spurious unauthenticated → /login hop after sign-in.
            if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
              router.refresh();
            }
          });
          unsub = () => subscription.unsubscribe();
        } catch {
          /* Supabase env missing — sign-in will surface configuration errors */
        }
      })
      .catch(() => {});
    return () => unsub?.();
  }, [fetchSession, router]);

  const update = useCallback(
    async (data?: { activeOrganizationId?: string | null; activeAgencyId?: string | null }) => {
      if (data?.activeAgencyId != null && data.activeAgencyId !== "") {
        await fetch("/api/auth/active-agency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ agencyId: data.activeAgencyId }),
        });
      }
      if (data?.activeOrganizationId) {
        await fetch("/api/auth/active-organization", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ organizationId: data.activeOrganizationId }),
        });
      }
      await fetchSession();
    },
    [fetchSession],
  );

  const value: AppAuthContextValue = { session, status, update };

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function useAppSession() {
  const ctx = useContext(AppAuthContext);
  if (!ctx) {
    throw new Error("useAppSession must be used within AppAuthProvider");
  }
  return { data: ctx.session, status: ctx.status, update: ctx.update };
}

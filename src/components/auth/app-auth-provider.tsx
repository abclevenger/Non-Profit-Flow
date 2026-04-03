"use client";

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
  update: (data?: { activeOrganizationId?: string | null }) => Promise<void>;
};

const AppAuthContext = createContext<AppAuthContextValue | null>(null);

const ME_RETRY_MS = 450;

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const oauthIntentApplied = useRef(false);

  const fetchSession = useCallback(async () => {
    try {
      let supabaseHasUser = false;

      try {
        const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
        const sb = createBrowserSupabaseClient();

        if (trustedDeviceExpiryRequiresReauth()) {
          clearTrustedDeviceMarker();
          await sb.auth.signOut();
        }

        const { data } = await sb.auth.getSession();
        supabaseHasUser = Boolean(data.session?.user);
      } catch {
        /* Supabase env missing */
      }

      const readMe = async () => {
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        return (await r.json()) as AppSession | { user: null };
      };

      let data = await readMe();
      if (data && "user" in data && data.user) {
        setSession(data as AppSession);
        setStatus("authenticated");
        return;
      }

      if (supabaseHasUser) {
        await new Promise((r) => setTimeout(r, ME_RETRY_MS));
        data = await readMe();
        if (data && "user" in data && data.user) {
          setSession(data as AppSession);
          setStatus("authenticated");
          return;
        }
      }

      setSession(null);
      setStatus("unauthenticated");
    } catch {
      setSession(null);
      setStatus("unauthenticated");
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
          } = sb.auth.onAuthStateChange(() => {
            void fetchSession();
            router.refresh();
          });
          unsub = () => subscription.unsubscribe();
        } catch {
          /* Supabase env missing — OTP login will surface configuration errors */
        }
      })
      .catch(() => {});
    return () => unsub?.();
  }, [fetchSession, router]);

  const update = useCallback(
    async (data?: { activeOrganizationId?: string | null }) => {
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

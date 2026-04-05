"use client";

import { clearOauthTrustIntent, clearTrustedDeviceMarker } from "@/lib/auth/trusted-device";

function clearAppBrowserStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.clear();
  } catch {
    /* private mode / blocked */
  }
  try {
    localStorage.clear();
  } catch {
    /* quota / private mode */
  }
  clearOauthTrustIntent();
  clearTrustedDeviceMarker();
}

/**
 * Ends Supabase session, clears workspace httpOnly cookies (via API), wipes client storage
 * (org/agency trust + demo-adjacent markers), then hard-navigates so RSC cache resets.
 */
export async function performClientSignOut(redirectTo: string = "/login"): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    /* offline — still attempt local cleanup */
  }

  clearAppBrowserStorage();

  try {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const sb = createBrowserSupabaseClient();
    await sb.auth.signOut();
  } catch {
    /* Supabase misconfigured */
  }

  window.location.assign(redirectTo);
}

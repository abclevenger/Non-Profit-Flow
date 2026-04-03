"use client";

import { clearTrustedDeviceMarker } from "@/lib/auth/trusted-device";

/**
 * Clears trusted-device state, ends the Supabase browser session, then navigates (full reload clears RSC cache).
 */
export async function performClientSignOut(redirectTo: string = "/login"): Promise<void> {
  clearTrustedDeviceMarker();
  try {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const sb = createBrowserSupabaseClient();
    await sb.auth.signOut();
  } catch {
    /* Supabase misconfigured */
  }
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}

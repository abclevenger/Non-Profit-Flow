"use client";

import { useSession } from "@/lib/auth/session-hooks";
import { useEffect, useRef } from "react";

const DEFAULT_MS = 45 * 60 * 1000;

async function signOutSupabaseAndRedirect() {
  try {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const sb = createBrowserSupabaseClient();
    await sb.auth.signOut();
  } catch {
    /* ignore */
  }
  window.location.href = "/login";
}

/**
 * Signs out after idle timeout (demo-friendly session hygiene).
 */
export function useIdleSignOut(idleMs: number = DEFAULT_MS) {
  const { status } = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void signOutSupabaseAndRedirect();
      }, idleMs);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, idleMs]);
}

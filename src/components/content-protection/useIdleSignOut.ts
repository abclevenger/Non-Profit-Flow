"use client";

import { performClientSignOut } from "@/lib/auth/client-sign-out";
import { isTrustedDeviceActive } from "@/lib/auth/trusted-device";
import { useSession } from "@/lib/auth/session-hooks";
import { useEffect, useRef } from "react";

/** Short session when the user did not opt into “Trust this device”. */
const STRICT_IDLE_MS = 45 * 60 * 1000;
/** Aligned with trusted-device window — inactivity only; calendar expiry is handled in AppAuthProvider. */
const TRUSTED_IDLE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Signs out after idle timeout. Trusted devices get a long idle window; others stay strict for shared-machine safety.
 */
export function useIdleSignOut() {
  const { status } = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const idleMs = isTrustedDeviceActive() ? TRUSTED_IDLE_MS : STRICT_IDLE_MS;

    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void performClientSignOut("/login");
      }, idleMs);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status]);
}

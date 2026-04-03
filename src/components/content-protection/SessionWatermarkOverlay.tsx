"use client";

import { useSession } from "next-auth/react";

/**
 * Subtle session watermark for traceability (deterrent only — not DRM).
 */
export function SessionWatermarkOverlay() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user?.email) {
    return null;
  }

  const name = session.user.name?.trim() || "Board member";
  const email = session.user.email;
  const when = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const line = `Viewed by ${name} (${email}) · ${when}`;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[5] overflow-hidden opacity-[0.07]"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] select-none text-center font-sans text-sm font-medium text-stone-900"
          style={{ lineHeight: 3 }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="mx-8 inline-block whitespace-nowrap">
              {line}
            </span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-3 right-4 z-[6] max-w-sm rounded-md bg-stone-900/75 px-3 py-1.5 text-[10px] leading-snug text-white/95 shadow-md backdrop-blur-sm">
        {line}
      </div>
    </>
  );
}

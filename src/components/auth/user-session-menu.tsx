"use client";

import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { useAppSession } from "./app-auth-provider";

export function UserSessionMenu() {
  const router = useRouter();
  const { data: session, status } = useAppSession();

  if (status === "loading") {
    return <span className="text-xs text-stone-500">Session…</span>;
  }
  if (!session?.user) {
    return null;
  }

  const { email, name, role } = session.user;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-stone-900">{name || email}</p>
        <p className="truncate text-xs text-stone-600">{email}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          {ROLE_LABELS[role]}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
            const sb = createBrowserSupabaseClient();
            await sb.auth.signOut();
          } catch {
            /* misconfigured client */
          }
          router.push("/login");
          router.refresh();
        }}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
      >
        Sign out
      </button>
    </div>
  );
}

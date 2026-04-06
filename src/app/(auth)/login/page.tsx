import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { getAppAuth } from "@/lib/auth/get-app-auth";

function safeCallbackPath(callbackUrl: string | string[] | undefined): string {
  const v = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  if (v && v.startsWith("/") && !v.startsWith("//")) return v;
  return "/overview";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const sp = await searchParams;
  /**
   * Only skip the form when Supabase + Prisma agree on an app user. Redirecting on Supabase alone
   * caused /login → /auth/post-signin → /login loops (or 500s) when the DB was down or the session
   * was stale — browsers show that as “This page isn’t working”.
   */
  let appSession = null;
  try {
    appSession = await getAppAuth();
  } catch {
    appSession = null;
  }
  if (appSession?.user?.id) {
    const next = safeCallbackPath(sp.callbackUrl);
    redirect(`/auth/post-signin?next=${encodeURIComponent(next)}`);
  }

  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

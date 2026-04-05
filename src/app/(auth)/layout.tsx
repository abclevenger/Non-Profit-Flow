import type { ReactNode } from "react";

/**
 * Auth shell pages must not depend on Prisma/SQLite. On serverless hosts, DB access
 * can fail or be misconfigured while Supabase Auth still works — calling getAppAuth()
 * here would 500 the entire /login page for signed-in users.
 *
 * Signed-in users hitting `/login` are redirected from `login/page.tsx` with `callbackUrl`
 * preserved so post-signin can apply platform-admin vs default landing correctly.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f2] px-4 py-12 pb-28">
      <div className="relative z-0 w-full max-w-md">{children}</div>
    </div>
  );
}
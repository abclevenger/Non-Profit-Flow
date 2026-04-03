import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { tryCreateServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Auth shell pages must not depend on Prisma/SQLite. On serverless hosts, DB access
 * can fail or be misconfigured while Supabase Auth still works — calling getAppAuth()
 * here would 500 the entire /login page for signed-in users.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  try {
    const cookieStore = await cookies();
    const supabase = tryCreateServerSupabaseClient(cookieStore);
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;
      if (!error && user?.email) {
        redirect("/overview");
      }
    }
  } catch {
    /* Let the login/register UI render if session refresh fails transiently */
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f2] px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
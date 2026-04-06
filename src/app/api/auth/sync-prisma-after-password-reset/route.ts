import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { syncPrismaUserFromSupabaseAuthUser } from "@/lib/auth/sync-prisma-user-from-supabase-session";
import { tryCreateServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Called after `updateUser({ password })` during recovery. Requires a valid Supabase session cookie.
 * Ensures `supabaseAuthId` is set and legacy `passwordHash` is cleared.
 */
export async function POST() {
  const cookieStore = await cookies();
  const supabase = tryCreateServerSupabaseClient(cookieStore);
  if (!supabase) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncPrismaUserFromSupabaseAuthUser(data.user);
  } catch (err) {
    console.error("[sync-prisma-after-password-reset]", err);
    return NextResponse.json({ error: "Could not sync account data." }, { status: 500 });
  }

  return NextResponse.json({ ok: true as const });
}

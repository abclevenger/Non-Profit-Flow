import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/lib/auth/active-org-cookie";
import { ACTIVE_AGENCY_COOKIE } from "@/lib/auth/active-agency-cookie";

export const dynamic = "force-dynamic";

/**
 * Clears httpOnly workspace cookies. Call from the browser before `signOut()` so the next
 * session never restores org/agency scope (including platform admin demo context).
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORGANIZATION_COOKIE);
  cookieStore.delete(ACTIVE_AGENCY_COOKIE);
  return NextResponse.json({ ok: true });
}

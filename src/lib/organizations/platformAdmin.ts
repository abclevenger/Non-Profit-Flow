import { NextResponse } from "next/server";
import type { Session } from "@/lib/auth/app-session";

export function isPlatformAdmin(session: Session | null): boolean {
  return Boolean(session?.user?.isPlatformAdmin);
}

/** Server routes: require Supabase-linked platform operator flag from Prisma (never trust client). */
export function assertPlatformAdmin(session: Session | null) {
  if (!session?.user?.id) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!session.user.isPlatformAdmin) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const };
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_AGENCY_COOKIE, activeAgencyCookieOptions } from "@/lib/auth/active-agency-cookie";
import { ALL_AGENCIES_COOKIE_VALUE } from "@/lib/auth/workspace-constants";
import { getAppAuth } from "@/lib/auth/get-app-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getAppAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const raw =
    typeof body === "object" && body && "agencyId" in body
      ? String((body as { agencyId: unknown }).agencyId).trim()
      : "";

  if (session.user.isPlatformAdmin) {
    const value = raw === "" || raw === ALL_AGENCIES_COOKIE_VALUE ? ALL_AGENCIES_COOKIE_VALUE : raw;
    if (value !== ALL_AGENCIES_COOKIE_VALUE) {
      const allowed = session.user.agencies.some((a) => a.id === value);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_AGENCY_COOKIE, value, activeAgencyCookieOptions());
    return NextResponse.json({ ok: true });
  }

  if (!raw || raw === ALL_AGENCIES_COOKIE_VALUE) {
    return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
  }
  const allowed = session.user.agencies.some((a) => a.id === raw);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_AGENCY_COOKIE, raw, activeAgencyCookieOptions());

  return NextResponse.json({ ok: true });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACTIVE_ORGANIZATION_COOKIE,
  activeOrganizationCookieOptions,
} from "@/lib/auth/active-org-cookie";
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
  const organizationId =
    typeof body === "object" && body && "organizationId" in body
      ? String((body as { organizationId: unknown }).organizationId).trim()
      : "";
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  }

  const allowed = session.user.organizations.some((o) => o.id === organizationId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organizationId, activeOrganizationCookieOptions());

  return NextResponse.json({ ok: true });
}

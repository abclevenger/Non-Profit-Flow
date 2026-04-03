import { cookies } from "next/headers";

export const ACTIVE_ORGANIZATION_COOKIE = "gf-active-organization-id";

export async function getActiveOrganizationIdFromCookie(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(ACTIVE_ORGANIZATION_COOKIE)?.value?.trim();
  return v || null;
}

export function activeOrganizationCookieOptions(maxAgeSec = 60 * 60 * 24 * 365) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

import { cookies } from "next/headers";
import { ALL_AGENCIES_COOKIE_VALUE } from "@/lib/auth/workspace-constants";

export const ACTIVE_AGENCY_COOKIE = "gf-active-agency-id";

export { ALL_AGENCIES_COOKIE_VALUE };

export async function getActiveAgencyIdFromCookie(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(ACTIVE_AGENCY_COOKIE)?.value?.trim();
  return v || null;
}

export function activeAgencyCookieOptions(maxAgeSec = 60 * 60 * 24 * 365) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

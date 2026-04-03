import type { Session } from "@/lib/auth/app-session";

/** Owner / org Admin — branding & module toggles for the active organization. */
export function canManageOrganizationSettings(session: Session | null): boolean {
  return session?.user?.canManageOrganizationSettings === true;
}

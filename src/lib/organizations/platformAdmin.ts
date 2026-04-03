import type { Session } from "@/lib/auth/app-session";

export function isPlatformAdmin(session: Session | null): boolean {
  return Boolean(session?.user?.isPlatformAdmin);
}

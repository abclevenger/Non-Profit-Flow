import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Returns membership if user belongs to org; otherwise null. */
export async function requireOrgMembership(userId: string, organizationId: string) {
  return prisma.organizationMembership.findFirst({
    where: { userId, organizationId },
    include: { organization: true },
  });
}

export async function assertOrgAccess(session: Session | null, organizationId: string) {
  if (!session?.user?.id) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  const m = await requireOrgMembership(session.user.id, organizationId);
  if (!m) {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }
  return { ok: true as const, membership: m };
}

import { prisma } from "@/lib/prisma";

/**
 * Live customers should not land in demo tenants by mistake.
 * Platform admins may always assign; others need `User.allowDemoOrganizationAssignment`.
 */
export async function assertUserMayJoinDemoOrganization(userId: string, organizationId: string) {
  const [org, user] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId }, select: { isDemoTenant: true } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { allowDemoOrganizationAssignment: true, isPlatformAdmin: true },
    }),
  ]);
  if (!org?.isDemoTenant) return { ok: true as const };
  if (user?.isPlatformAdmin || user?.allowDemoOrganizationAssignment) return { ok: true as const };
  return {
    ok: false as const,
    error: "This account is not approved for demo-organization membership. Contact your administrator.",
  };
}

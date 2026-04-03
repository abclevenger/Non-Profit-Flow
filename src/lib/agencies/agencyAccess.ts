import { prisma } from "@/lib/prisma";
import type { AgencySeatKind } from "@/lib/agencies/agencyRole";

/** Active owner or agency member seat for an agency (for RLS-style checks). */
export async function resolveAgencySeat(userId: string, agencyId: string): Promise<AgencySeatKind | null> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { ownerUserId: true },
  });
  if (!agency) return null;
  if (agency.ownerUserId === userId) return "OWNER";
  const m = await prisma.agencyMember.findFirst({
    where: { userId, agencyId, status: "ACTIVE" },
    select: { role: true },
  });
  if (!m) return null;
  return m.role === "AGENCY_ADMIN" ? "AGENCY_ADMIN" : "AGENCY_STAFF";
}

export async function userMayAccessOrganizationViaAgency(
  userId: string,
  organizationAgencyId: string,
): Promise<AgencySeatKind | null> {
  return resolveAgencySeat(userId, organizationAgencyId);
}

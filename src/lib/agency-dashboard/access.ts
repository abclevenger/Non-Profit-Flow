import { auth } from "@/auth";
import { resolveAgencySeat } from "@/lib/agencies/agencyAccess";
import { prisma } from "@/lib/prisma";

export type AgencyDashboardSeat = "platform" | "OWNER" | "AGENCY_ADMIN" | "AGENCY_STAFF";

export type AgencyDashboardAccess = {
  agency: {
    id: string;
    name: string;
    isWhiteLabel: boolean;
    ownerUserId: string;
    brandingDisplayName: string | null;
    brandingLogoUrl: string | null;
    brandingPrimaryColor: string | null;
    brandingSupportEmail: string | null;
    brandingFooterText: string | null;
  };
  seat: AgencyDashboardSeat;
  /** Create orgs, invite agency team, edit branding. */
  canManageAgency: boolean;
};

export async function getAgencyDashboardAccess(agencyId: string): Promise<AgencyDashboardAccess | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      id: true,
      name: true,
      isWhiteLabel: true,
      ownerUserId: true,
      brandingDisplayName: true,
      brandingLogoUrl: true,
      brandingPrimaryColor: true,
      brandingSupportEmail: true,
      brandingFooterText: true,
    },
  });
  if (!agency) return null;

  if (session.user.isPlatformAdmin) {
    return {
      agency,
      seat: "platform",
      canManageAgency: true,
    };
  }

  const seat = await resolveAgencySeat(session.user.id, agencyId);
  if (!seat) return null;

  const canManageAgency = seat === "OWNER" || seat === "AGENCY_ADMIN";
  return {
    agency,
    seat,
    canManageAgency,
  };
}

export async function requireAgencyDashboardAccess(agencyId: string): Promise<AgencyDashboardAccess> {
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) {
    throw new Error("FORBIDDEN");
  }
  return access;
}

import "server-only";

import { prisma } from "@/lib/prisma";

export type PlatformAgencyRow = {
  id: string;
  name: string;
  isWhiteLabel: boolean;
  isDemoAgency: boolean;
  owner: { id: string; email: string; name: string | null };
  nonprofitCount: number;
  agencyMemberCount: number;
};

export async function loadPlatformAgenciesOverview(): Promise<PlatformAgencyRow[]> {
  const agencies = await prisma.agency.findMany({
    orderBy: { name: "asc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { organizations: true, members: true } },
    },
  });

  return agencies.map((a) => ({
    id: a.id,
    name: a.name,
    isWhiteLabel: a.isWhiteLabel,
    isDemoAgency: a.isDemoAgency,
    owner: a.owner,
    nonprofitCount: a._count.organizations,
    agencyMemberCount: a._count.members,
  }));
}

export type PlatformOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  isDemoTenant: boolean;
  agencyId: string;
  agencyName: string;
};

export async function loadPlatformOrganizationsForAssignment(): Promise<PlatformOrganizationRow[]> {
  const rows = await prisma.organization.findMany({
    orderBy: [{ agency: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      isDemoTenant: true,
      agencyId: true,
      agency: { select: { name: true } },
    },
  });
  return rows.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    isDemoTenant: o.isDemoTenant,
    agencyId: o.agencyId,
    agencyName: o.agency.name,
  }));
}

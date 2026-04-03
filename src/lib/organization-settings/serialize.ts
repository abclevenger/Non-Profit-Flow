import type { OrganizationSettings as OrganizationSettingsRow } from "@prisma/client";
import type { SampleProfileId } from "@/lib/mock-data/types";
import { mergeModulesState, parseModulesJson } from "./modules";
import type { OrganizationSettingsPublic } from "./types";
import { isSampleProfileId } from "./validation";

export function toOrganizationSettingsPublic(
  row: OrganizationSettingsRow,
): OrganizationSettingsPublic | null {
  if (!isSampleProfileId(row.profileId)) return null;
  return {
    profileId: row.profileId,
    organizationName: row.organizationName,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    useAccentColor: row.useAccentColor,
    modules: mergeModulesState(parseModulesJson(row.modulesJson)),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function coerceProfileId(raw: string | null): SampleProfileId | null {
  if (!raw || !isSampleProfileId(raw)) return null;
  return raw;
}

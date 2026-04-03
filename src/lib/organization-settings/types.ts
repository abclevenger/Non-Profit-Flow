import type { SampleProfileId } from "@/lib/mock-data/types";
import type { DashboardModulesState } from "./modules";

export type OrganizationSettingsPublic = {
  profileId: SampleProfileId;
  organizationName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  useAccentColor: boolean;
  modules: DashboardModulesState;
  updatedAt: string | null;
};

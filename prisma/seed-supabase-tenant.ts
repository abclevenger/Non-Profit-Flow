/**
 * Re-export for `tsx prisma/seed.ts` / standalone scripts — implementation lives in `src/lib/tenant/seedSupabaseTenantData.ts`.
 */
export {
  profileForDemoKey,
  seedSupabaseTenantForDemoOrg,
  seedSupabaseTenantForOrganization,
  seedSupabaseTenantFromProfile,
} from "../src/lib/tenant/seedSupabaseTenantData";

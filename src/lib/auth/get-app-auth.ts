import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCreateServerSupabaseClient } from "@/lib/supabase/server";
import type { AppSession } from "./app-session";
import { getActiveAgencyIdFromCookie } from "./active-agency-cookie";
import { getActiveOrganizationIdFromCookie } from "./active-org-cookie";
import { isMemberRole, type MemberRole } from "./roles";
import { emptyWorkspaceSessionState, loadOrgSessionState } from "./sessionOrganizations";
import { ensureDemoUserFlagOnUser } from "@/lib/demo/demo-agency-member";

function roleFromDb(value: string | undefined | null): MemberRole {
  if (value && isMemberRole(value)) return value;
  return "BOARD_MEMBER";
}

/**
 * Server-only: Supabase session + Prisma user + org state.
 * Creates a Prisma `User` on first sign-in (email OTP) if missing.
 */
export async function getAppAuth(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const supabase = tryCreateServerSupabaseClient(cookieStore);
  if (!supabase) return null;

  let su: User | null = null;
  let authError: Awaited<ReturnType<typeof supabase.auth.getUser>>["error"] = null;
  try {
    const res = await supabase.auth.getUser();
    authError = res.error;
    su = res.data?.user ?? null;
  } catch {
    return null;
  }
  if (authError || !su?.email) return null;

  const email = su.email.toLowerCase();
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    const name =
      (typeof su.user_metadata?.full_name === "string" && su.user_metadata.full_name) ||
      (typeof su.user_metadata?.name === "string" && su.user_metadata.name) ||
      null;
    dbUser = await prisma.user.create({
      data: {
        email,
        name,
        supabaseAuthId: su.id,
      },
    });
  } else if (dbUser.supabaseAuthId !== su.id) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { supabaseAuthId: su.id },
    });
  }

  await ensureDemoUserFlagOnUser(prisma, dbUser.id, dbUser.email);
  dbUser = await prisma.user.findUnique({ where: { id: dbUser.id } });
  if (!dbUser) return null;

  const preferredOrg = await getActiveOrganizationIdFromCookie();
  const preferredAgency = await getActiveAgencyIdFromCookie();
  let orgState;
  try {
    orgState = await loadOrgSessionState(dbUser.id, preferredOrg, {
      isPlatformAdmin: Boolean(dbUser.isPlatformAdmin),
      preferredAgencyId: preferredAgency,
    });
  } catch (err) {
    console.error("[getAppAuth] loadOrgSessionState failed; using empty workspace", err);
    orgState = emptyWorkspaceSessionState();
  }
  const legacyRole = roleFromDb(dbUser.role);

  const image =
    (typeof su.user_metadata?.avatar_url === "string" && su.user_metadata.avatar_url) || dbUser.image || null;

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? name ?? email,
      image,
      isPlatformAdmin: Boolean(dbUser.isPlatformAdmin),
      isDemoUser: Boolean(dbUser.isDemoUser),
      role: orgState.organizations.length > 0 ? orgState.effectiveMemberRole : legacyRole,
      agencies: orgState.agencies,
      activeAgencyId: orgState.activeAgencyId,
      activeAgency: orgState.activeAgency,
      agencyMembershipRole: orgState.agencyMembershipRole,
      isAgencyOwner: orgState.isAgencyOwner,
      canManageAgency: orgState.canManageAgency,
      agencyScopeIsAll: orgState.agencyScopeIsAll,
      organizations: orgState.organizations,
      activeOrganizationId: orgState.activeOrganizationId,
      activeOrganization: orgState.activeOrganization,
      activeMembership: orgState.activeMembership,
      membershipRole: orgState.membershipRole,
      canManageOrganizationSettings: orgState.canManageOrganizationSettings,
      canManageIssueRouting: orgState.canManageIssueRouting,
      canViewAllExpertReviewsInOrg: orgState.canViewAllExpertReviewsInOrg,
    },
  };
}

import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCreateServerSupabaseClient } from "@/lib/supabase/server";
import type { AppSession } from "./app-session";
import { getActiveAgencyIdFromCookie } from "./active-agency-cookie";
import { getActiveOrganizationIdFromCookie } from "./active-org-cookie";
import { devBypassUserEmail, isDevAuthBypassActive } from "./dev-auth-bypass-flags";
import { isMemberRole, type MemberRole } from "./roles";
import { emptyWorkspaceSessionState, loadOrgSessionState } from "./sessionOrganizations";
import { ensureDemoUserFlagOnUser } from "@/lib/demo/demo-agency-member";

function roleFromDb(value: string | undefined | null): MemberRole {
  if (value && isMemberRole(value)) return value;
  return "BOARD_MEMBER";
}

/**
 * Insecure dev-only: full platform-admin session without Supabase cookies.
 * See `DISABLE_APP_AUTH` in `.env.example`.
 */
async function getBypassAppAuth(): Promise<AppSession | null> {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[auth] DISABLE_APP_AUTH is on — using Prisma-only platform-admin session (not for production).",
    );
  }
  const email = devBypassUserEmail();
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (dbUser && !dbUser.isPlatformAdmin) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { isPlatformAdmin: true, role: "ADMIN" },
    });
  }
  if (!dbUser) {
    dbUser = await prisma.user.findFirst({
      where: { isPlatformAdmin: true },
      orderBy: { createdAt: "asc" },
    });
  }
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name: "Dev bypass admin",
        role: "ADMIN",
        isPlatformAdmin: true,
      },
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
      isPlatformAdmin: true,
      preferredAgencyId: preferredAgency,
    });
  } catch (err) {
    console.error("[getAppAuth] bypass loadOrgSessionState failed; using empty workspace", err);
    orgState = emptyWorkspaceSessionState();
  }
  const legacyRole = roleFromDb(String(dbUser.role));
  const displayName = dbUser.name?.trim() || email;

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: displayName,
      image: dbUser.image || null,
      isPlatformAdmin: true,
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

async function getAppAuthFromSupabaseUser(su: User): Promise<AppSession | null> {
  if (!su.email) return null;

  const email = su.email.toLowerCase();
  const name =
    (typeof su.user_metadata?.full_name === "string" && su.user_metadata.full_name) ||
    (typeof su.user_metadata?.name === "string" && su.user_metadata.name) ||
    null;

  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name,
        supabaseAuthId: su.id,
      },
    });
  } else {
    const needsUpdate =
      dbUser.supabaseAuthId !== su.id ||
      (Boolean(name) && dbUser.name !== name) ||
      dbUser.passwordHash != null;
    if (needsUpdate) {
      /* Supabase Auth owns passwords — drop legacy Prisma bcrypt when present. */
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          supabaseAuthId: su.id,
          ...(name && dbUser.name !== name ? { name } : {}),
          ...(dbUser.passwordHash != null ? { passwordHash: null } : {}),
        },
      });
    }
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
  const legacyRole = roleFromDb(String(dbUser.role));

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

/**
 * Server-only: Supabase session + Prisma user + org state.
 * Creates or links a Prisma `User` on first successful Supabase-authenticated request if missing.
 *
 * Order matters: a valid Supabase user always wins over `DISABLE_APP_AUTH` bypass
 * (otherwise magic-link sign-in would still impersonate the bypass user).
 */
export async function getAppAuth(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const supabase = tryCreateServerSupabaseClient(cookieStore);

  if (supabase) {
    try {
      const res = await supabase.auth.getUser();
      if (!res.error && res.data.user?.email) {
        return await getAppAuthFromSupabaseUser(res.data.user);
      }
    } catch (err) {
      console.error("[getAppAuth] supabase.auth.getUser failed", err);
    }
  }

  if (isDevAuthBypassActive()) {
    return getBypassAppAuth();
  }

  return null;
}

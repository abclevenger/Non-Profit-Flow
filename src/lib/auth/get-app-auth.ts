import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tryCreateServerSupabaseClient } from "@/lib/supabase/server";
import type { AppSession } from "./app-session";
import { getActiveOrganizationIdFromCookie } from "./active-org-cookie";
import { isMemberRole, type MemberRole } from "./roles";
import { loadOrgSessionState } from "./sessionOrganizations";

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

  const {
    data: { user: su },
    error,
  } = await supabase.auth.getUser();
  if (error || !su?.email) return null;

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

  const preferredOrg = await getActiveOrganizationIdFromCookie();
  const orgState = await loadOrgSessionState(dbUser.id, preferredOrg);
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
      role: orgState.organizations.length > 0 ? orgState.effectiveMemberRole : legacyRole,
      organizations: orgState.organizations,
      activeOrganizationId: orgState.activeOrganizationId,
      activeOrganization: orgState.activeOrganization,
      membershipRole: orgState.membershipRole,
      canManageOrganizationSettings: orgState.canManageOrganizationSettings,
      canManageIssueRouting: orgState.canManageIssueRouting,
      canViewAllExpertReviewsInOrg: orgState.canViewAllExpertReviewsInOrg,
    },
  };
}

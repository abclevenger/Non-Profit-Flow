import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth/get-app-auth";
import { ACTIVE_AGENCY_COOKIE } from "@/lib/auth/active-agency-cookie";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/lib/auth/active-org-cookie";

export const dynamic = "force-dynamic";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/overview";
  const noHash = raw.split("#")[0] ?? "/overview";
  return noHash || "/overview";
}

/** Pathname only (no query), for comparing “generic” post-login targets. */
function nextPathname(rawNext: string): string {
  const noHash = rawNext.split("#")[0] ?? rawNext;
  const noQuery = noHash.split("?")[0] ?? noHash;
  const p = noQuery.trim() || "/";
  return p === "" ? "/" : p;
}

function normalizeLandingPathname(pathname: string): string {
  const lower = pathname.trim().toLowerCase();
  if (lower === "" || lower === "/") return "/";
  return lower.replace(/\/+$/, "") || "/";
}

/** `/` or `/overview` (case- and trailing-slash insensitive) — eligible for role-based default landing. */
function isDefaultWorkspaceLanding(pathname: string): boolean {
  const n = normalizeLandingPathname(pathname);
  return n === "/" || n === "/overview";
}

/**
 * Platform admins must hit the hub first unless `next` is already an operator surface.
 * (Otherwise `callbackUrl` from middleware — e.g. /strategy or a saved demo URL — wins and
 * workspace cookies keep a demo org active.)
 */
function platformAdminAllowsExplicitNext(rawNext: string): boolean {
  const path = normalizeLandingPathname(nextPathname(rawNext));
  if (path === "/platform-admin" || path.startsWith("/platform-admin/")) return true;
  if (path.startsWith("/agency/")) return true;
  return false;
}

/**
 * After Supabase auth, landing priority:
 * A. Platform admin → `/platform-admin` (or allowlisted `next`), always clear workspace cookies
 * B. Explicit non-default `next` path → follow it
 * C. Single agency + agency-level seat → `/agency/[id]`
 * D. Otherwise → `/overview`
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const pathnameOnly = nextPathname(next);
  const hasExplicitSafeNext = !isDefaultWorkspaceLanding(pathnameOnly);

  let session: Awaited<ReturnType<typeof getAppAuth>>;
  try {
    session = await getAppAuth();
  } catch (err) {
    console.error("[post-signin] getAppAuth failed", err);
    return NextResponse.redirect(new URL("/login?error=auth_backend", url.origin));
  }
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  // Same request as getAppAuth — `isPlatformAdmin` already came from Prisma on the server.
  const isPlatformAdmin = Boolean(session.user.isPlatformAdmin);

  if (isPlatformAdmin) {
    const allowExplicit = platformAdminAllowsExplicitNext(next);
    const destPath = allowExplicit ? next : "/platform-admin";
    if (process.env.NODE_ENV === "development") {
      console.info("[post-signin] platform-admin routing", {
        next,
        isPlatformAdmin: true,
        allowExplicitNext: allowExplicit,
        destPath,
      });
    }
    const res = NextResponse.redirect(new URL(destPath, url.origin));
    res.cookies.delete(ACTIVE_ORGANIZATION_COOKIE);
    res.cookies.delete(ACTIVE_AGENCY_COOKIE);
    return res;
  }

  if (hasExplicitSafeNext) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const agencies = session.user.agencies;
  if (
    agencies.length === 1 &&
    (agencies[0]!.isOwner ||
      agencies[0]!.agencyMembershipRole === "AGENCY_ADMIN" ||
      agencies[0]!.agencyMembershipRole === "AGENCY_STAFF")
  ) {
    return NextResponse.redirect(new URL(`/agency/${agencies[0]!.id}`, url.origin));
  }

  return NextResponse.redirect(new URL("/overview", url.origin));
}

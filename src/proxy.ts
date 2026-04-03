import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessVotingWorkspace } from "@/lib/auth/permissions";
import { isMemberRole, type MemberRole } from "@/lib/auth/roles";
import { updateSession } from "@/utils/supabase/middleware";

function roleFromToken(role: unknown): MemberRole {
  return typeof role === "string" && isMemberRole(role) ? role : "GUEST";
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function proxy(req: NextRequest) {
  const supabaseResponse = await updateSession(req);
  const { pathname } = req.nextUrl;
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (pathname.startsWith("/api/auth")) {
    return supabaseResponse;
  }
  if (isPublic) {
    return supabaseResponse;
  }
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "AUTH_SECRET is not configured" }, { status: 500 });
  }
  const token = await getToken({ req, secret });
  if (!token) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    const redirect = NextResponse.redirect(login);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  const role = roleFromToken(token.role);

  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      const denied = new URL("/forbidden", req.nextUrl.origin);
      denied.searchParams.set("reason", "admin");
      const redirect = NextResponse.redirect(denied);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
  }

  if (pathname === "/voting" || pathname.startsWith("/voting/")) {
    if (!canAccessVotingWorkspace(role)) {
      const denied = new URL("/forbidden", req.nextUrl.origin);
      denied.searchParams.set("reason", "vote");
      const redirect = NextResponse.redirect(denied);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

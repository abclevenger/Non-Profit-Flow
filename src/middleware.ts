import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function middleware(req: NextRequest) {
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
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";
import { compare } from "bcryptjs";
import type { MemberRole } from "@/lib/auth/roles";
import { isAdminLevelRole, isMemberRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/auth/totp";

function roleFromDb(value: string | undefined | null): MemberRole {
  if (value && isMemberRole(value)) return value;
  return "BOARD_MEMBER";
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      totp: { label: "Authenticator code", type: "text" },
    },
    authorize: async (credentials) => {
      const emailRaw = credentials?.email;
      const passwordRaw = credentials?.password;
      const totpRaw = credentials?.totp;
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
      const password = typeof passwordRaw === "string" ? passwordRaw : "";
      const totp = typeof totpRaw === "string" ? totpRaw.trim() : "";
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const passwordOk = await compare(password, user.passwordHash);
      if (!passwordOk) return null;

      const r = roleFromDb(user.role);
      const needs2fa =
        isAdminLevelRole(r) && user.twoFactorEnabled && Boolean(user.twoFactorSecret);
      if (needs2fa) {
        if (!totp || !verifyTotpToken(user.twoFactorSecret!, totp)) return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: r,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) {
  providers.push(
    MicrosoftEntraID({
      ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
        ? { issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER }
        : {}),
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  trustHost: true,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        const db = await prisma.user.findUnique({ where: { id: user.id } });
        token.role = roleFromDb(db?.role);
      }
      if (trigger === "update" && session && typeof session === "object" && "role" in session) {
        token.role = roleFromDb(session.role as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = roleFromDb(token.role as string);
      }
      return session;
    },
  },
});
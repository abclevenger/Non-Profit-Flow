import type { DefaultSession } from "next-auth";
import type { MemberRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface User {
    role?: MemberRole;
  }
  interface Session {
    user: {
      id: string;
      role: MemberRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: MemberRole;
  }
}
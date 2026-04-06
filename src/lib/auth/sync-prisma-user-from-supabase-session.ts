import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

/**
 * Aligns Prisma `User` with the current Supabase Auth user (e.g. after password reset).
 * Clears legacy `passwordHash` when present — Supabase is the password authority.
 */
export async function syncPrismaUserFromSupabaseAuthUser(su: SupabaseUser): Promise<void> {
  if (!su.email) return;
  const email = su.email.toLowerCase();
  const name =
    (typeof su.user_metadata?.full_name === "string" && su.user_metadata.full_name) ||
    (typeof su.user_metadata?.name === "string" && su.user_metadata.name) ||
    null;

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    await prisma.user.create({
      data: {
        email,
        name,
        supabaseAuthId: su.id,
      },
    });
    return;
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      supabaseAuthId: su.id,
      ...(dbUser.passwordHash != null ? { passwordHash: null } : {}),
      ...(name && !dbUser.name ? { name } : {}),
    },
  });
}

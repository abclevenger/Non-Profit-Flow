import { PrismaClient } from "@prisma/client";

/**
 * One client per server isolate (dev HMR + Vercel lambda warm instance).
 * Caching only in development used to be common; skipping production cache creates
 * a new PrismaClient per import and can exhaust Supabase connection limits → P1001 / timeouts
 * surfaced as "could not reach the database".
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = prisma;

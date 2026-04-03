/**
 * Central Supabase environment resolution.
 * Prefer NEXT_PUBLIC_SUPABASE_ANON_KEY; legacy PUBLISHABLE_DEFAULT_KEY still supported.
 */

export function getSupabaseUrl(): string | undefined {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return v || undefined;
}

/** Public anon key — safe to bundle; RLS still applies in Supabase. */
export function getSupabaseAnonKey(): string | undefined {
  const v =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();
  return v || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Server-only: never import this from client components. */
export function getSupabaseServiceRoleKey(): string | undefined {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return v || undefined;
}

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";
import { logServiceRoleAdminClient } from "./log-service-role-debug";

/**
 * Bypasses RLS — use only in Route Handlers / Server Actions after you verify
 * the caller with `getAppAuth()` / `auth()` from `@/auth`. Never import from Client Components.
 *
 * @param context — dev-only log label (which route/lib created the client). TODO(remove) with log-service-role-debug.
 */
export function createServiceRoleSupabaseClient(context = "createServiceRoleSupabaseClient()") {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error(
      "Service role client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).",
    );
  }
  logServiceRoleAdminClient(context);
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

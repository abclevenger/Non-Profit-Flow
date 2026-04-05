import "server-only";

import { getSupabaseServiceRoleKey } from "./env";

let presenceLogged = false;

/** Dev-only: log once whether the server process sees the key (boolean only, never the secret). */
export function logServiceRoleEnvOnce(): void {
  if (process.env.NODE_ENV !== "development") return;
  if (presenceLogged) return;
  presenceLogged = true;
  console.info("[supabase:service-role] SERVICE_ROLE_PRESENT:", Boolean(getSupabaseServiceRoleKey()));
}

/**
 * Dev-only: logs SERVICE_ROLE_PRESENT once, then which code path created the admin client.
 * TODO(remove): delete this file and calls when finished auditing service-role usage.
 */
export function logServiceRoleAdminClient(context: string): void {
  if (process.env.NODE_ENV !== "development") return;
  logServiceRoleEnvOnce();
  console.info("[supabase:service-role] admin client →", context);
}

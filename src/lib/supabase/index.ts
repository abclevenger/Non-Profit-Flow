/** Public barrel: no service-role exports — import `@/lib/supabase/admin` only from server Route Handlers / RSC. */
export { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from "./env";
export { createBrowserSupabaseClient } from "./browser";
export { createServerSupabaseClient, tryCreateServerSupabaseClient } from "./server";
export { updateSupabaseSession } from "./update-supabase-session";

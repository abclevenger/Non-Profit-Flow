import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/session-cookie-options";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export type CookieWrite = {
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export type IssueOtpSessionOk = {
  redirectPath: string;
  cookieWrites: Map<string, CookieWrite>;
  email: string;
};

type IssueOtpSessionFail = { ok: false; message: string; httpStatus: number };

/**
 * Admin `generateLink` (magiclink OTP) + anon `verifyOtp` — same cookie path as user email OTP.
 */
export async function issueSupabaseEmailOtpSession(params: {
  email: string;
  nextPath: string;
  cookieStore: CookieStore;
  /** Dev / seeded flows default long-lived (30-day) cookies. */
  persistLongLived?: boolean;
}): Promise<{ ok: true; data: IssueOtpSessionOk } | IssueOtpSessionFail> {
  const rawEmail = params.email.trim().toLowerCase();
  if (!rawEmail) {
    return { ok: false, message: "Email is required", httpStatus: 400 };
  }

  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !anonKey) {
    return { ok: false, message: "Supabase is not configured", httpStatus: 503 };
  }

  if (!isServiceRoleConfigured()) {
    return {
      ok: false,
      message: "SUPABASE_SERVICE_ROLE_KEY is required for this sign-in path (server-only).",
      httpStatus: 503,
    };
  }

  const admin = createServiceRoleSupabaseClient("issue-supabase-email-otp-session");
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: rawEmail,
  });

  if (linkErr || !linkData?.properties?.email_otp) {
    console.error("[issueSupabaseEmailOtpSession] generateLink failed:", linkErr?.message ?? "no otp");
    return {
      ok: false,
      message: "Could not issue sign-in link (check Supabase Auth and service role key).",
      httpStatus: 500,
    };
  }

  const otp = linkData.properties.email_otp;
  const redirectPath = `/auth/post-signin?next=${encodeURIComponent(params.nextPath)}`;
  const cookieWrites = new Map<string, CookieWrite>();

  const persistLongLived = params.persistLongLived !== false;

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookieOptions: getSupabaseAuthCookieOptions(persistLongLived),
    cookies: {
      getAll() {
        return params.cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieWrites.set(name, { value, options });
        }
      },
    },
  });

  const { error: verifyErr } = await supabase.auth.verifyOtp({
    email: rawEmail,
    token: otp,
    type: "email",
  });

  if (verifyErr) {
    console.error("[issueSupabaseEmailOtpSession] verifyOtp failed:", verifyErr.message);
    return { ok: false, message: "Could not establish session", httpStatus: 500 };
  }

  return {
    ok: true,
    data: { redirectPath, cookieWrites, email: rawEmail },
  };
}

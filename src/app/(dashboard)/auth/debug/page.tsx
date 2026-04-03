import { auth } from "@/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthDebugClient } from "./AuthDebugClient";

export const dynamic = "force-dynamic";

export default async function AuthDebugPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/debug");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <p className="text-sm text-stone-600">
        <Link href="/overview" className="font-semibold text-stone-800 underline">
          Back to dashboard
        </Link>
      </p>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Supabase auth & connection</h1>
        <p className="mt-2 text-sm text-stone-600">
          Server session (Prisma user + org context) and live checks. Uses only the anon key on the client — no service role.
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Server session</h2>
        <dl className="mt-3 space-y-2 text-sm text-stone-800">
          <div>
            <dt className="text-stone-500">User id (Prisma)</dt>
            <dd className="font-mono text-xs">{session.user.id}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Email</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Role</dt>
            <dd>{session.user.role}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Organizations</dt>
            <dd>{session.user.organizations.length}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Environment</h2>
        <p className="mt-2 text-sm text-stone-700">
          Supabase public env configured: <strong>{isSupabaseConfigured() ? "yes" : "no"}</strong>
        </p>
      </section>

      <AuthDebugClient />
    </div>
  );
}

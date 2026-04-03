import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SupabaseDemoPanels } from "./SupabaseDemoPanels";

export const dynamic = "force-dynamic";

export default async function SupabaseDemoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/supabase-demo");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <p className="text-sm text-stone-600">
        <Link href="/overview" className="font-semibold text-stone-800 underline">
          Back to dashboard
        </Link>
      </p>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Supabase integration</h1>
        <p className="mt-2 text-sm text-stone-600">
          Live checks against your Supabase project. Create a <code className="rounded bg-stone-100 px-1">todos</code> table
          (SQL in <code className="rounded bg-stone-100 px-1">.env.example</code>) if you want list/insert demos.
        </p>
        {!isSupabaseConfigured() ? (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200/80">
            <strong>Not configured.</strong> Set <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel, redeploy, then
            refresh this page.
          </p>
        ) : null}
      </div>
      <SupabaseDemoPanels />
    </div>
  );
}

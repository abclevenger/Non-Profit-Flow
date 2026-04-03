import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f5f2] px-6 py-16 text-center">
      <div className="max-w-lg space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Mission Impact Legal Advisors</p>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">Governance</h1>
        <p className="text-sm leading-relaxed text-stone-600">
          Sign in with your board email to open the secure preview. Password sign-in supports authenticator apps for admin
          and chair roles; SSO is available when configured.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
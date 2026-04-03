import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f5f2] px-6 py-16 text-center">
      <div className="max-w-lg space-y-4">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/govflow-logo.png"
            alt=""
            width={128}
            height={152}
            className="h-28 w-auto object-contain sm:h-32"
            priority
          />
          <p className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">Non-Profit Flow</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Mission Impact Legal Advisors</p>
        <h1 className="font-serif text-xl font-semibold text-stone-900 sm:text-2xl">Board governance workspace</h1>
        <p className="text-sm leading-relaxed text-stone-600">
          Sign in with your board email. We send a one-time code — no password. New users are created automatically on first
          successful sign-in.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          Sign in with email code
        </Link>
      </div>
    </div>
  );
}
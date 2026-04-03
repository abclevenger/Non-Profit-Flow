import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID);
  const hasMicrosoft = Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID);
  return (
    <>
      <Suspense
        fallback={<div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">Loading…</div>}
      >
        <LoginForm hasGoogle={hasGoogle} hasMicrosoft={hasMicrosoft} />
      </Suspense>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </>
  );
}
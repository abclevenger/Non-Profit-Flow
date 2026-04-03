import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">Loading…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
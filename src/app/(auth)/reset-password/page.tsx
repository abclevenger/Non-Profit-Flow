import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
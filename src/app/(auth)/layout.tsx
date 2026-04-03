import type { ReactNode } from "react";
import { getAppAuth } from "@/lib/auth/get-app-auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getAppAuth();
  if (session?.user) {
    redirect("/overview");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f2] px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
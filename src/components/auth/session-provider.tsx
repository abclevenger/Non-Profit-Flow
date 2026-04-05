"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppAuthProvider } from "./app-auth-provider";
import { AuthReadyBoundary } from "./auth-ready-boundary";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <AppAuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-full items-center justify-center bg-[#f7f5f2] px-6 py-16 text-sm text-stone-600">
            Loading…
          </div>
        }
      >
        <AuthReadyBoundary>{children}</AuthReadyBoundary>
      </Suspense>
    </AppAuthProvider>
  );
}
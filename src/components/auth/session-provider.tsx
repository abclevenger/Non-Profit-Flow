"use client";

import type { ReactNode } from "react";
import { AppAuthProvider } from "./app-auth-provider";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <AppAuthProvider>{children}</AppAuthProvider>;
}
"use client";

import { performClientSignOut } from "@/lib/auth/client-sign-out";

type LogOutButtonProps = {
  className?: string;
};

export function LogOutButton({ className }: LogOutButtonProps) {
  return (
    <button type="button" onClick={() => void performClientSignOut("/login")} className={className}>
      Log out
    </button>
  );
}

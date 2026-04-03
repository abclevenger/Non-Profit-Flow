"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ForbiddenBody() {
  const search = useSearchParams();
  const reason = search.get("reason");

  const copy =
    reason === "admin"
      ? {
          title: "Administrators only",
          body: "This section is reserved for organization administrators. If you need access, ask your board chair or admin.",
        }
      : reason === "organization-settings"
        ? {
            title: "Organization settings",
            body: "Only admins and board chairs can change organization branding and identity. If you need changes, ask your board chair.",
          }
        : reason === "settings-routing"
          ? {
              title: "Issue routing",
              body: "Configuring review routing is limited to administrators. Board chairs can still open Organization Settings for branding.",
            }
          : reason === "vote"
            ? {
                title: "Voting workspace",
                body: "Guest and view-only accounts cannot open the voting and decision workflow. Board members, committee, and leadership roles can participate; coordinators can adjust access when you go live.",
              }
            : reason === "settings"
              ? {
                  title: "Access limited",
                  body: "You do not have permission to open this settings area.",
                }
              : {
                  title: "Access limited",
                  body: "You do not have permission to open this page with your current account.",
                };

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white/80 p-8 shadow-sm ring-1 ring-white/60 backdrop-blur-md">
      <h1 className="font-serif text-2xl font-semibold text-stone-900">{copy.title}</h1>
      <p className="text-sm leading-relaxed text-stone-600">{copy.body}</p>
      <Link
        href="/overview"
        className="inline-block text-sm font-semibold text-stone-800 underline-offset-4 hover:underline"
      >
        Return to board overview
      </Link>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-stone-500" aria-live="polite">
          Loading…
        </p>
      }
    >
      <ForbiddenBody />
    </Suspense>
  );
}

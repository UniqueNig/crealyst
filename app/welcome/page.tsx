import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WelcomeForm } from "./welcome-form";

export const metadata: Metadata = {
  title: "Welcome — set up your portfolio",
  robots: { index: false, follow: false },
};

function profileIsComplete(p: { title: string; bio: string } | null) {
  if (!p) return false;
  return p.title.trim().length > 0 && p.bio.trim().length >= 30;
}

export default async function WelcomePage() {
  const session = await verifySession();
  const profile = await prisma.profile.findUnique({
    where: { userId: session.sub },
    select: { name: true, title: true, tagline: true, bio: true, location: true },
  });

  // If the user already filled in the basics, the wizard has nothing to do —
  // send them straight to the dashboard. Users can refine details there.
  if (profileIsComplete(profile)) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight"
        >
          <SiteName />
        </Link>
        <Link
          href="/admin"
          className="text-xs text-[color:var(--muted)] hover:text-foreground"
        >
          Skip for now →
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-10 sm:py-16">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
              Step 1 of 1
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome, {session.username}.
            </h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Tell visitors who you are. Just the basics — you can refine
              everything later from your dashboard.
            </p>
          </div>

          <WelcomeForm
            initial={{
              name: profile?.name ?? "",
              title: profile?.title ?? "",
              tagline: profile?.tagline ?? "",
              bio: profile?.bio ?? "",
              location: profile?.location ?? "",
            }}
            username={session.username}
          />
        </div>
      </main>
    </div>
  );
}

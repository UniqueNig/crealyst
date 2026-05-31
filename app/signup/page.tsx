import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isTenantMode } from "@/lib/tenants";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your portfolio",
  description:
    "Sign up free. Build your portfolio in minutes — no code, no redeploys.",
  robots: { index: true, follow: true },
};

export default async function SignupPage() {
  // Single-tenant deployments (NEXT_PUBLIC_TENANT_USERNAME set) shouldn't
  // accept new signups — the tenant user already exists, and anyone else
  // signing up would just pollute the database with portfolios at /u/<name>
  // that the owner never asked for.
  if (isTenantMode()) notFound();

  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight"
        >
          <SiteName />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your portfolio
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Takes a minute. Free while in early access.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    suspended?: string;
    deactivated?: string;
  }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { from, suspended, deactivated } = await searchParams;

  const flash =
    deactivated === "1"
      ? "This account has been deactivated. Contact support to restore it."
      : suspended === "1"
        ? "This account has been suspended. Contact support to appeal."
        : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          <SiteName />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Sign in to manage your portfolio.
            </p>
          </div>

          {flash && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
              {flash}
            </p>
          )}

          <LoginForm next={from} />

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-[color:var(--muted)]">
            <Link
              href="/forgot-password"
              className="hover:text-[color:var(--foreground)]"
            >
              Forgot password?
            </Link>
            <p>
              No account yet?{" "}
              <Link href="/signup" className="text-brand-500 hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

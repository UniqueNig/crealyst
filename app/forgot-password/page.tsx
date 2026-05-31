import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
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
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Drop your email — we&apos;ll send you a reset link.
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
            Remembered it?{" "}
            <Link href="/login" className="text-brand-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

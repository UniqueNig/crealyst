import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { consumeVerificationToken } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await consumeVerificationToken(token);

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
          {result.status === "success" && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-500/20">
                <CheckCircle2 size={22} className="text-brand-500" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Email verified
              </h1>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {result.email} is now confirmed.
              </p>
              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white"
              >
                Go to dashboard
              </Link>
            </div>
          )}
          {result.status === "error" && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                Couldn&apos;t verify
              </h1>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {result.message}
              </p>
              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface)]"
              >
                Back to dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

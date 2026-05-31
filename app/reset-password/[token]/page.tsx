import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

async function tokenLooksValid(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
    select: { resetTokenExpiry: true },
  });
  if (!user || !user.resetTokenExpiry) return false;
  return user.resetTokenExpiry.getTime() > Date.now();
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const valid = await tokenLooksValid(token);

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
          {valid ? (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Choose a new password
                </h1>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  At least 8 characters.
                </p>
              </div>
              <ResetPasswordForm token={token} />
            </>
          ) : (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
              <h2 className="text-base font-semibold">
                This reset link has expired
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Reset links are valid for 60 minutes and one use only. Request
                a new one below.
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white"
              >
                Request a new link
              </Link>
            </div>
          )}

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

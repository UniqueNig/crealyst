import Link from "next/link";
import { SiteName } from "@/components/layout/site-name";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you're looking for doesn't exist or has moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-mono text-base font-semibold tracking-tight"
          >
            <SiteName />
          </Link>
        </div>
      </header>

      <main className="relative flex-1 pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[500px] max-w-6xl"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(45,91,255,0.18), transparent 70%)",
          }}
        />

        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:py-32">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-500">
            Error 404
          </span>

          <h1 className="mt-6 select-none text-[8rem] font-semibold leading-none tracking-tighter md:text-[12rem]">
            <span className="bg-gradient-to-b from-foreground to-[color:var(--muted)]/40 bg-clip-text text-transparent">
              4
            </span>
            <span className="text-brand-500">0</span>
            <span className="bg-gradient-to-b from-foreground to-[color:var(--muted)]/40 bg-clip-text text-transparent">
              4
            </span>
          </h1>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
            This page took a wrong turn.
          </h2>
          <p className="mt-3 max-w-md text-[color:var(--muted)]">
            The URL you tried doesn&apos;t match anything that exists — yet. It
            might have moved, or maybe it never existed. Let&apos;s get you
            back on track.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition-transform hover:-translate-y-0.5"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Take me home
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[color:var(--surface)]"
            >
              Build your portfolio
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

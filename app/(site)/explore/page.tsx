import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicPortfolios } from "@/lib/data/discovery";
import { isTenantMode } from "@/lib/tenants";
import { PortfolioGrid } from "./portfolio-grid";

export const metadata: Metadata = {
  title: "Explore portfolios",
  description:
    "Browse public portfolios. Developers, designers, marketers, analysts, and more.",
};

export default async function ExplorePage() {
  // In tenant mode the deployment is a single-user portfolio — discovery
  // doesn't apply, so this route just 404s.
  if (isTenantMode()) notFound();

  const portfolios = await getPublicPortfolios();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-[color:var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-mono text-base font-semibold tracking-tight"
          >
            folo<span className="text-brand-500">nest</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/explore"
              className="hidden rounded-full px-4 py-1.5 text-sm font-medium text-foreground sm:inline-flex"
            >
              Explore
            </Link>
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-sm text-[color:var(--muted)] hover:text-foreground sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 sm:gap-2 sm:px-4"
            >
              Get started
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--muted)]">
              <Sparkles size={12} className="text-brand-500" />
              {portfolios.length}{" "}
              {portfolios.length === 1 ? "portfolio" : "portfolios"} live
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Explore <span className="text-brand-500">portfolios</span>
            </h1>
            <p className="mt-4 text-base text-[color:var(--muted)]">
              Real people building real things. Click in to see their work.
            </p>
          </div>

          <div className="mt-12">
            {portfolios.length === 0 ? (
              <EmptyState />
            ) : (
              <PortfolioGrid portfolios={portfolios} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[color:var(--border)] p-12 text-center">
      <p className="text-sm text-[color:var(--muted)]">
        No public portfolios yet. Be the first —{" "}
        <Link href="/signup" className="text-brand-500 hover:underline">
          sign up
        </Link>
        .
      </p>
    </div>
  );
}

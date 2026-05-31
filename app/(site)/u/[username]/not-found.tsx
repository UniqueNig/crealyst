import Link from "next/link";
import { Compass, Search } from "lucide-react";

/**
 * Rendered when a /u/<username> route can't resolve the user — either the
 * username doesn't exist, or the account is suspended / deactivated. Lives
 * one level above the tenant layout so it DOESN'T inherit the navbar
 * (which would crash trying to render a profile that isn't there).
 */
export default function TenantNotFound() {
  return (
    <main className="relative flex-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[400px] max-w-6xl"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(45,91,255,0.16), transparent 70%)",
        }}
      />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-500">
          404
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          That portfolio doesn&apos;t exist.
        </h1>
        <p className="mt-4 max-w-md text-[color:var(--muted)]">
          The username you typed isn&apos;t registered — or the owner has
          paused their account. Try browsing other portfolios.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            <Compass size={14} />
            Browse portfolios
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[color:var(--surface)]"
          >
            <Search size={14} />
            Build your own
          </Link>
        </div>
      </section>
    </main>
  );
}

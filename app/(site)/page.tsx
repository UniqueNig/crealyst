import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles, Code2, Rocket } from "lucide-react";
import { isTenantMode, getTenantUsername } from "@/lib/tenants";
import { redirect } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A beautiful, SEO-friendly portfolio with a built-in admin panel. No code, no redeploys.",
};

export default async function MarketingLanding() {
  // In tenant mode (single-user deployment), proxy.ts already rewrites this
  // route — but if for any reason it doesn't, fall back to a server redirect.
  if (isTenantMode()) {
    const tenant = getTenantUsername();
    if (tenant) redirect(`/u/${tenant}`);
  }

  return (
    <>
      {/* Marketing header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-[color:var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-mono text-base font-semibold tracking-tight"
          >
            folo<span className="text-brand-500">nest</span>
          </Link>
          {/* `Explore` hides on mobile to give the two essential CTAs room.
              Visitors can still reach it via the footer or by typing the URL. */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/explore"
              className="hidden rounded-full px-4 py-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] sm:inline-flex"
            >
              Explore
            </Link>
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] sm:px-4"
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
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[600px] max-w-6xl"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(45,91,255,0.18), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--muted)]">
                <Sparkles size={12} className="text-brand-500" />
                Now in early access
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Your portfolio,
                <br />
                <span className="text-brand-500">beautifully done.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-base text-[color:var(--muted)] md:text-lg">
                A beautiful portfolio with a built-in admin panel — for
                developers, designers, marketers, analysts, and anyone with
                work worth showing. Add your projects, services, experience,
                and contact form, all without touching code.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  Build mine — free
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/u/emmanuel"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface)]"
                >
                  See an example
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/40">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <Reveal>
              <div className="text-center">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
                  Built for shipping
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                  Everything you need,
                  <br />
                  <span className="text-brand-500">nothing you don&apos;t.</span>
                </h2>
              </div>
            </Reveal>

            <Stagger className="mt-16 grid gap-5 md:grid-cols-3">
              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <article className="flex h-full flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                      <f.icon size={22} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[color:var(--muted)]">
                      {f.body}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
                How it works
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Three steps. <span className="text-brand-500">No code.</span>
              </h2>
            </div>
          </Reveal>

          <Stagger className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-sm text-brand-500">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[color:var(--muted)]">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-8 py-16 text-center md:px-16 md:py-24">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(45,91,255,0.18), transparent 70%)",
                }}
              />
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                Ready to ship your portfolio?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[color:var(--muted)]">
                Sign up in 60 seconds. Free while in early access.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  Create your portfolio
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-[color:var(--border)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-[color:var(--muted)] sm:flex-row sm:items-center">
            <p>
              folo<span className="text-brand-500">nest</span> ·{" "}
              {new Date().getFullYear()}
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-[color:var(--foreground)]">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-[color:var(--foreground)]">
                Sign up
              </Link>
              <Link href="/u/emmanuel" className="hover:text-[color:var(--foreground)]">
                Example
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

const FEATURES = [
  {
    icon: Code2,
    title: "Looks like you spent weeks on it",
    body: "Polished aesthetic, real motion, SEO meta + sitemap. Picks up your accent color, your name, your work — and renders like a hand-built site.",
  },
  {
    icon: Sparkles,
    title: "Live admin panel",
    body: "Edit your bio, projects, services, experience, education, certifications, skills — and watch your public portfolio update instantly.",
  },
  {
    icon: Rocket,
    title: "Ship in minutes",
    body: "Sign up, pick your username, fill in your story. Your portfolio is live at your own clean URL.",
  },
];

const STEPS = [
  {
    title: "Sign up",
    body: "Email + password + the username you want for your URL. Takes a minute.",
  },
  {
    title: "Fill in your story",
    body: "Bio, photo, projects, services, experience, skills — all from one admin panel. No code.",
  },
  {
    title: "Share your link",
    body: "Your portfolio lives at your own clean URL. Edit anytime, no redeploy.",
  },
];

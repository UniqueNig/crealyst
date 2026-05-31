import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown, Download } from "lucide-react";
import type { Profile } from "@prisma/client";
import { Reveal } from "@/components/ui/reveal";
import { forceDownloadUrl } from "@/lib/download-url";
import { tenantHref } from "@/lib/tenants";

type Props = { profile: Profile | null; username: string };

export function Hero({ profile, username }: Props) {
  // The seeded profile starts blank ("" not null), so use `||` to fall through
  // empty strings to the placeholders the friend replaces during onboarding.
  const name = profile?.name?.trim() || "Your Name";
  const title = profile?.title?.trim() || "Graphic Designer";
  const tagline =
    profile?.tagline?.trim() || "Crafting brands, layouts, and visual stories.";
  const avatar = profile?.avatarUrl;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="ambient-mesh" />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.4fr_1fr] md:items-center md:py-32">
        <div>
          <Reveal>
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[color:var(--muted)]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
              </span>
              Available for new projects
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              {name.split(" ")[0]}
              <br />
              <span className="text-brand-500">{name.split(" ").slice(1).join(" ")}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-4 text-base font-medium text-[color:var(--foreground)] md:text-lg">
              {title}
            </p>
            <p className="mt-3 max-w-xl text-base text-[color:var(--muted)] md:text-lg">
              {tagline}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={tenantHref(username, "/projects")}
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                View work
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={tenantHref(username, "/contact")}
                className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[color:var(--foreground)]"
              >
                Get in touch
              </Link>
              {/* CV download. If the user uploaded a custom PDF use that;
                  otherwise link to the auto-generated CV route which builds
                  a PDF from their portfolio data on the fly. */}
              <a
                href={
                  profile?.resumeUrl
                    ? forceDownloadUrl(
                        profile.resumeUrl,
                        `${name.replace(/\s+/g, "_")}_CV`
                      )
                    : tenantHref(username, "/cv")
                }
                download
                className="group inline-flex items-center gap-2 px-1 text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-brand-500"
              >
                <Download
                  size={14}
                  className="transition-transform group-hover:translate-y-0.5"
                />
                Download CV
              </a>
            </div>
          </Reveal>
        </div>

        {avatar && (
          <Reveal delay={0.12} className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-500/30 via-transparent to-brand-500/10 blur-2xl" />
              <div className="glass-panel relative rounded-[2rem] p-2.5">
                <div className="relative size-60 overflow-hidden rounded-[1.6rem] md:size-72">
                  <Image
                    src={avatar}
                    alt={name}
                    fill
                    sizes="320px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <Link
        href="#about"
        aria-label="Scroll to about"
        className="mx-auto mb-12 flex w-fit items-center gap-2 text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      >
        Scroll
        <ArrowDown size={12} className="animate-bounce" />
      </Link>
    </section>
  );
}

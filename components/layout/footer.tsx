import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/brand";
import { tenantHref } from "@/lib/tenants";

type Props = {
  username: string;
  brand?: string;
  socials?: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    email?: string | null;
  };
};

export function Footer({ username, brand = "portfolio", socials }: Props) {
  const year = new Date().getFullYear();
  // Only show what the owner has actually filled in — no hardcoded fallbacks,
  // so a portfolio with no socials set simply renders no social icons.
  const s = socials ?? {};

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--background)]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div>
          <p className="font-mono text-sm font-semibold tracking-tight">
            {brand}<span className="text-brand-500">.</span>
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            &copy; {year} {brand}. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href={tenantHref(username, "/about")} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
            About
          </Link>
          <Link href={tenantHref(username, "/services")} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
            Services
          </Link>
          <Link href={tenantHref(username, "/projects")} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
            Projects
          </Link>
          <Link href={tenantHref(username, "/contact")} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {s.github && (
            <a
              href={s.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              <GithubIcon size={16} />
            </a>
          )}
          {s.linkedin && (
            <a
              href={s.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              <LinkedinIcon size={16} />
            </a>
          )}
          {s.twitter && (
            <a
              href={s.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Twitter"
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              <TwitterIcon size={16} />
            </a>
          )}
          {s.email && (
            <a
              href={`mailto:${s.email}`}
              aria-label="Email"
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              <Mail size={16} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

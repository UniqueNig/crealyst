"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MapPin, Search, FolderKanban } from "lucide-react";
import type { DiscoveryPortfolio } from "@/lib/data/discovery";
import { resolveTheme } from "@/lib/themes";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PortfolioGrid({
  portfolios,
}: {
  portfolios: DiscoveryPortfolio[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return portfolios;
    return portfolios.filter((p) => {
      const haystack = [p.name, p.title, p.tagline, p.location ?? "", p.username]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [portfolios, query]);

  return (
    <>
      <div className="mx-auto mb-10 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, title, or location"
            className="w-full rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-brand-500 focus:outline-none"
            aria-label="Search portfolios"
          />
        </div>
        {query && (
          <p className="mt-2 text-center text-xs text-[color:var(--muted)]">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-[color:var(--muted)]">
          No portfolios match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PortfolioCard key={p.id} portfolio={p} />
          ))}
        </ul>
      )}
    </>
  );
}

function PortfolioCard({ portfolio: p }: { portfolio: DiscoveryPortfolio }) {
  const theme = resolveTheme(p.accent);
  const accent = theme?.scale[500] ?? "var(--color-brand-500)";

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all hover:-translate-y-1 hover:border-[color:var(--border)] hover:shadow-lg">
      <Link
        href={`/u/${p.username}`}
        className="flex h-full flex-col gap-4 p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar name={p.name} avatarUrl={p.avatarUrl} accent={accent} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold tracking-tight">
              {p.name}
            </p>
            <p className="truncate text-xs text-[color:var(--muted)]">
              {p.title}
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-[color:var(--muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ color: accent }}
          />
        </div>

        <p className="line-clamp-2 text-sm text-[color:var(--muted)]">
          {p.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-[color:var(--muted)]">
          {p.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{p.location}</span>
            </span>
          )}
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono">
            <FolderKanban size={11} />
            {p.projectCount} {p.projectCount === 1 ? "project" : "projects"}
          </span>
        </div>
      </Link>
      {/* Tinted accent strip — each card hints at the user's chosen theme. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: accent }}
      />
    </li>
  );
}

function Avatar({
  name,
  avatarUrl,
  accent,
}: {
  name: string;
  avatarUrl: string | null;
  accent: string;
}) {
  if (avatarUrl) {
    return (
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)]">
        <Image
          src={avatarUrl}
          alt={`${name}'s avatar`}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold text-white"
      style={{ backgroundColor: accent }}
      aria-hidden
    >
      {initials(name) || "??"}
    </div>
  );
}

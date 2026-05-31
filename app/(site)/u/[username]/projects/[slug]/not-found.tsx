"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Rendered when the user exists but the requested project slug doesn't.
 * Sits inside the tenant layout so the user's navbar / footer / theme stay
 * in place — visitors realize they're on Jane's site, the project just isn't
 * there.
 */
export default function ProjectNotFound() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-500">
        404
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
        Project not found.
      </h1>
      <p className="mt-4 text-[color:var(--muted)]">
        This case study has been removed, renamed, or never existed.
      </p>
      <Link
        href={`/u/${username}/projects`}
        className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft
          size={14}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        See all projects
      </Link>
    </section>
  );
}

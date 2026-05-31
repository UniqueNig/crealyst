import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { getProjectBySlug, getProjects } from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Reveal } from "@/components/ui/reveal";
import { GithubIcon } from "@/components/icons/brand";

type Params = { username: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "Project not found" };
  const project = await getProjectBySlug(user.id, slug);
  if (!project) return { title: "Project not found" };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const canonical = `${siteUrl}/u/${username}/projects/${project.slug}`;
  const title = project.metaTitle ?? project.title;
  const description = project.metaDesc ?? project.summary;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: project.coverImage, width: 1600, height: 900 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.coverImage],
    },
  };
}

export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username, slug } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const [project, all] = await Promise.all([
    getProjectBySlug(user.id, slug),
    getProjects(user.id),
  ]);
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = idx >= 0 && idx + 1 < all.length ? all[idx + 1] : all[0];

  return (
    <article className="pb-24">
      <header className="mx-auto max-w-4xl px-6 pt-24 md:pt-32">
        <Reveal>
          <Link
            href={`/u/${username}/projects`}
            className="group inline-flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            All projects
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
            <span className="font-mono">{project.year}</span>
            <span className="size-1 rounded-full bg-[color:var(--muted)]" />
            <span>{project.role}</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-[color:var(--muted)] md:text-xl">
            {project.summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                Live site
                <ExternalLink size={14} />
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[color:var(--surface)]"
              >
                <GithubIcon size={14} />
                View code
              </a>
            )}
          </div>
        </Reveal>
      </header>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-6xl px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)]">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-6xl gap-12 px-6 md:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <div className="prose prose-invert flex flex-col gap-6 text-base leading-relaxed text-[color:var(--foreground)] md:text-lg">
            <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
            <p>{project.description}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <aside className="flex flex-col gap-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Role
              </p>
              <p className="mt-1 text-sm">{project.role}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Year
              </p>
              <p className="mt-1 text-sm">{project.year}</p>
            </div>
            {project.techStack.length > 0 && (
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Stack
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.techStack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-2.5 py-0.5 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </Reveal>
      </div>

      {project.gallery.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
              Gallery
            </p>
          </Reveal>
          <div className="mt-6 flex flex-col gap-6">
            {project.gallery.map((url, i) => (
              <Reveal key={url} delay={i * 0.05}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-[color:var(--border)]">
                  <Image
                    src={url}
                    alt={`${project.title} screenshot ${i + 1}`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {next && next.slug !== project.slug && (
        <section className="mx-auto mt-24 max-w-6xl border-t border-[color:var(--border)] px-6 pt-12">
          <Link
            href={`/u/${username}/projects/${next.slug}`}
            className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Next project
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                {next.title}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-brand-500 group-hover:underline">
              Read case study
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </section>
      )}
    </article>
  );
}

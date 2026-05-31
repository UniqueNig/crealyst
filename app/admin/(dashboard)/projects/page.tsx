import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/admin/ui/button";
import { ProjectRowActions } from "./project-row-actions";

export default async function ProjectsAdminPage() {
  const session = await verifySession();
  const projects = await prisma.project.findMany({
    where: { userId: session.sub },
    orderBy: [{ order: "asc" }, { year: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Projects"
        description="Each project gets its own case-study page at /projects/[slug]."
        actions={
          <Link href="/admin/projects/new">
            <Button>
              <Plus size={14} />
              New project
            </Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No projects yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[color:var(--background)]">
                {p.coverImage && (
                  <Image
                    src={p.coverImage}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  {!p.published && (
                    <span className="rounded-full bg-[color:var(--background)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
                      Draft
                    </span>
                  )}
                  {p.featured && (
                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-500">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[color:var(--muted)]">
                  {p.summary}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[color:var(--muted)]">
                  <span className="font-mono">{p.year}</span>
                  <span>·</span>
                  <span>{p.role}</span>
                  <span>·</span>
                  <span className="font-mono">/projects/{p.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/projects/${p.slug}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  aria-label="View on site"
                >
                  <ExternalLink size={14} />
                </Link>
                <Link
                  href={`/admin/projects/${p.id}/edit`}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </Link>
                <ProjectRowActions id={p.id} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

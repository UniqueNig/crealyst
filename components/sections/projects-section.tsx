import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/cards/project-card";
import { tenantHref } from "@/lib/tenants";

type Props = { projects: Project[]; username: string };

export function ProjectsSection({ projects, username }: Props) {
  if (projects.length === 0) return null;

  const allProjectsHref = tenantHref(username, "/projects");

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="flex flex-col gap-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Selected work"
              title={
                <>
                  Projects I&apos;ve{" "}
                  <span className="text-brand-500">shipped</span>
                </>
              }
              description="A handful of things I'm proud of — from solo builds to client engagements. Click any to read the full case study."
            />
            <Link
              href={allProjectsHref}
              className="group hidden items-center gap-2 text-sm font-medium text-brand-500 hover:underline md:inline-flex"
            >
              All projects
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        <Stagger className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard
                project={p}
                href={tenantHref(username, `/projects/${p.slug}`)}
                className="h-full"
              />
            </StaggerItem>
          ))}
        </Stagger>

        <Link
          href={allProjectsHref}
          className="group inline-flex items-center gap-2 self-start text-sm font-medium text-brand-500 hover:underline md:hidden"
        >
          All projects
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}

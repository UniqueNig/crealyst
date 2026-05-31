import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@prisma/client";
import { cn } from "@/lib/cn";

type Props = { project: Project; href: string; className?: string };

export function ProjectCard({ project, href, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "glass-panel glass-hover group relative flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--surface)]">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]">
          <span className="font-mono">{project.year}</span>
          <span className="size-1 rounded-full bg-[color:var(--muted)]" />
          <span>{project.role}</span>
        </div>

        <h3 className="text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {project.title}
        </h3>
        <p className="text-sm text-[color:var(--muted)]">{project.summary}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.techStack.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-[11px] text-[color:var(--muted)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <ArrowUpRight
        size={18}
        className="absolute right-5 top-5 text-[color:var(--foreground)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

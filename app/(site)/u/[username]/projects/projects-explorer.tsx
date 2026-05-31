"use client";

import { useMemo, useState } from "react";
import type { Project } from "@prisma/client";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/cards/project-card";

type Props = {
  projects: Project[];
  username: string;
};

/**
 * Tag-filtered project grid. Collects every unique tag across the user's
 * projects, renders them as chips above the grid, and filters client-side
 * when a chip is selected. Single-select for now — clicking the active chip
 * (or "All") clears the filter.
 */
export function ProjectsExplorer({ projects, username }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Tag list is derived from the data, so adding a tag in admin automatically
  // makes it a filter option here — no separate "tags catalog" to maintain.
  const tags = useMemo(() => {
    const seen = new Set<string>();
    for (const p of projects) {
      for (const t of p.tags) {
        const trimmed = t.trim();
        if (trimmed) seen.add(trimmed);
      }
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!activeTag) return projects;
    return projects.filter((p) => p.tags.includes(activeTag));
  }, [projects, activeTag]);

  return (
    <>
      {tags.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-2">
          <ChipButton
            label="All"
            count={projects.length}
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {tags.map((t) => {
            const count = projects.filter((p) => p.tags.includes(t)).length;
            return (
              <ChipButton
                key={t}
                label={t}
                count={count}
                active={activeTag === t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
              />
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-16 rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No projects tagged &ldquo;{activeTag}&rdquo; yet.
        </p>
      ) : (
        <Stagger
          // Re-key on the filter so cards re-animate when the user filters.
          key={activeTag ?? "all"}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          {filtered.map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard
                project={p}
                href={`/u/${username}/projects/${p.slug}`}
                className="h-full"
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </>
  );
}

function ChipButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors " +
        (active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-brand-500/40 hover:text-foreground")
      }
    >
      {label}
      <span
        className={
          "rounded-full px-1.5 py-0.5 text-[10px] font-mono " +
          (active ? "bg-white/20" : "bg-[color:var(--border)]/40")
        }
      >
        {count}
      </span>
    </button>
  );
}

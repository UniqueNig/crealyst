import type { Education } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function EducationSection({ items }: { items: Education[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Education"
            title={
              <>
                Where I <span className="text-brand-500">studied</span>
              </>
            }
          />
        </Reveal>

        <Stagger className="flex flex-col gap-4">
          {items.map((e) => (
            <StaggerItem
              key={e.id}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {e.school}
                </h3>
                <span className="font-mono text-xs text-[color:var(--muted)]">
                  {e.range}
                </span>
              </div>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">
                {e.degree}
              </p>
              {e.location && (
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {e.location}
                </p>
              )}
              {e.description && (
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {e.description}
                </p>
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

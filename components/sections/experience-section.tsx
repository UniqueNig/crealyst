import type { Experience } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

function formatRange(start: Date | string, end: Date | string | null) {
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export function ExperienceSection({ items }: { items: Experience[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Experience"
              title={
                <>
                  Where I&apos;ve{" "}
                  <span className="text-brand-500">contributed</span>
                </>
              }
            />
          </Reveal>

          <Stagger className="flex flex-col gap-8">
            {items.map((e) => (
              <StaggerItem
                key={e.id}
                className="relative pl-8 before:absolute before:left-0 before:top-2 before:size-3 before:rounded-full before:border-2 before:border-brand-500 before:bg-[color:var(--background)]"
              >
                <div className="absolute left-1.5 top-5 -z-10 h-full w-px bg-[color:var(--border)]" />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight md:text-xl">
                      {e.role}
                      <span className="text-[color:var(--muted)]"> · {e.company}</span>
                    </h3>
                    <span className="font-mono text-xs text-[color:var(--muted)]">
                      {formatRange(e.startDate, e.endDate)}
                    </span>
                  </div>
                  {e.location && (
                    <p className="text-xs text-[color:var(--muted)]">
                      {e.location}
                    </p>
                  )}
                  {e.description && (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {e.description}
                    </p>
                  )}
                  {e.bullets.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {e.bullets.map((b, i) => (
                        <li
                          key={i}
                          className="text-sm text-[color:var(--muted)] before:mr-2 before:text-brand-500 before:content-['•']"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

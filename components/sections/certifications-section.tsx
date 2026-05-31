import { Award, ExternalLink } from "lucide-react";
import type { Certification } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function CertificationsSection({ items }: { items: Certification[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Certifications"
              title={
                <>
                  Courses & <span className="text-brand-500">credentials</span>
                </>
              }
            />
          </Reveal>

          <Stagger className="grid gap-3 sm:grid-cols-2">
            {items.map((c) => {
              const Wrapper = c.credentialUrl ? "a" : "div";
              return (
                <StaggerItem key={c.id}>
                  <Wrapper
                    {...(c.credentialUrl
                      ? {
                          href: c.credentialUrl,
                          target: "_blank",
                          rel: "noreferrer noopener",
                        }
                      : {})}
                    className="group flex h-full items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/40"
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                      <Award size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">
                        {c.issuer} ·{" "}
                        <span className="font-mono">{c.year}</span>
                      </p>
                    </div>
                    {c.credentialUrl && (
                      <ExternalLink
                        size={14}
                        className="shrink-0 text-[color:var(--muted)] opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    )}
                  </Wrapper>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

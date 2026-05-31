import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Profile, Skill } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillBadge } from "@/components/ui/skill-badge";
import { tenantHref } from "@/lib/tenants";

type Props = { profile: Profile | null; skills: Skill[]; username: string };

export function AboutSummary({ profile, skills, username }: Props) {
  return (
    <section
      id="about"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title={<>A bit about me</>}
          />
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal>
            <p className="text-lg leading-relaxed text-[color:var(--foreground)]">
              {profile?.bio ?? "Bio coming soon."}
            </p>
          </Reveal>

          {skills.length > 0 && (
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Toolkit
              </p>
              <Stagger className="flex flex-wrap gap-2" gap={0.04}>
                {skills.map((s) => (
                  <StaggerItem key={s.id}>
                    <SkillBadge name={s.name} iconUrl={s.iconUrl} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}

          <Reveal>
            <Link
              href={tenantHref(username, "/about")}
              className="group inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:underline"
            >
              More about me
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

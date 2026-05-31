import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/brand";
import {
  getProfile,
  getSkills,
  getExperience,
  getEducation,
  getCertifications,
} from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillTile } from "@/components/ui/skill-badge";
import { ExperienceSection } from "@/components/sections/experience-section";
import { EducationSection } from "@/components/sections/education-section";
import { CertificationsSection } from "@/components/sections/certifications-section";
import { CtaSection } from "@/components/sections/cta-section";
import { forceDownloadUrl } from "@/lib/download-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `About — ${username}`,
    description: `About ${username} — background, work philosophy, and the tools they build with.`,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const [profile, skills, experience, education, certifications] =
    await Promise.all([
      getProfile(user.id),
      getSkills(user.id),
      getExperience(user.id),
      getEducation(user.id),
      getCertifications(user.id),
    ]);

  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
            About
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            Engineer first.
            <br />
            <span className="text-brand-500">Designer second.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.6fr] md:items-start">
            {profile?.avatarUrl && (
              <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-3xl border border-[color:var(--border)]">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-6 text-lg leading-relaxed text-[color:var(--foreground)]">
              <p>{profile?.bio}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {profile?.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm transition-colors hover:border-brand-500/40"
                  >
                    <GithubIcon size={14} />
                    GitHub
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm transition-colors hover:border-brand-500/40"
                  >
                    <LinkedinIcon size={14} />
                    LinkedIn
                  </a>
                )}
                {profile?.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm transition-colors hover:border-brand-500/40"
                  >
                    <TwitterIcon size={14} />
                    Twitter
                  </a>
                )}
                {profile?.resumeUrl && (
                  <a
                    href={forceDownloadUrl(
                      profile.resumeUrl,
                      `${profile.name.replace(/\s+/g, "_")}_CV`
                    )}
                    download
                    className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  >
                    <Download
                      size={14}
                      className="transition-transform group-hover:translate-y-0.5"
                    />
                    Download résumé
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {skills.length > 0 && (
        <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/40">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <Reveal>
              <SectionHeading
                eyebrow="Stack"
                title={<>Tools I build with</>}
                description="A practical, opinionated stack — chosen for shipping fast without cutting corners."
              />
            </Reveal>
            <Stagger
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              gap={0.04}
            >
              {skills.map((s) => (
                <StaggerItem key={s.id}>
                  <SkillTile name={s.name} iconUrl={s.iconUrl} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <ExperienceSection items={experience} />
      <EducationSection items={education} />
      <CertificationsSection items={certifications} />
      <CtaSection username={username} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/brand";
import { getProfile } from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { UnverifiedOwnerNotice } from "@/components/contact/unverified-notice";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Contact — ${username}`,
    description: `Get in touch with ${username}.`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const profile = await getProfile(user.id);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
          Contact
        </span>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Get in <span className="text-brand-500">touch</span>.
        </h1>
        <p className="mt-6 max-w-xl text-base text-[color:var(--muted)] md:text-lg">
          Have a project, a role, or just want to chat? Send a message — I read
          everything and reply within a day or two.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <Reveal>
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Direct
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="group inline-flex items-center gap-3 hover:text-brand-500"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--border)] group-hover:border-brand-500/40">
                      <Mail size={14} />
                    </span>
                    {profile.email}
                  </a>
                )}
                {profile?.location && (
                  <p className="inline-flex items-center gap-3 text-[color:var(--muted)]">
                    <span className="inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--border)]">
                      <MapPin size={14} />
                    </span>
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Elsewhere
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile?.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm hover:border-brand-500/40"
                  >
                    <GithubIcon size={14} /> GitHub
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm hover:border-brand-500/40"
                  >
                    <LinkedinIcon size={14} /> LinkedIn
                  </a>
                )}
                {profile?.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm hover:border-brand-500/40"
                  >
                    <TwitterIcon size={14} /> Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {user.emailVerified ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:p-8">
              <ContactForm targetUsername={username} />
            </div>
          ) : (
            <UnverifiedOwnerNotice />
          )}
        </Reveal>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import type { Profile } from "@prisma/client";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact/contact-form";
import { UnverifiedOwnerNotice } from "@/components/contact/unverified-notice";
import { tenantHref } from "@/lib/tenants";

type Props = {
  profile: Profile | null;
  username: string;
  isVerified: boolean;
};

export function ContactSection({ profile, username, isVerified }: Props) {
  return (
    <section
      id="contact"
      className="border-t border-[color:var(--border)] scroll-mt-24"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr] md:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title={<>Let&apos;s make something <span className="text-brand-500">beautiful</span>.</>}
            description="Open to projects, collaborations, and just hellos. Drop a line below or reach me directly."
          />

          <div className="mt-8 flex flex-col gap-3 text-sm">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex items-center gap-3 text-[color:var(--foreground)] hover:text-brand-500"
              >
                <span className="glass inline-flex size-9 items-center justify-center rounded-full transition-colors group-hover:border-brand-500/40">
                  <Mail size={14} />
                </span>
                {profile.email}
              </a>
            )}
            {profile?.location && (
              <p className="inline-flex items-center gap-3 text-[color:var(--muted)]">
                <span className="glass inline-flex size-9 items-center justify-center rounded-full">
                  <MapPin size={14} />
                </span>
                {profile.location}
              </p>
            )}
          </div>

          <Link
            href={tenantHref(username, "/contact")}
            className="mt-8 inline-flex text-sm font-medium text-brand-500 hover:underline"
          >
            Go to full contact page →
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          {isVerified ? (
            <div className="glass-panel p-6 md:p-8">
              <ContactForm compact targetUsername={username} />
            </div>
          ) : (
            <UnverifiedOwnerNotice />
          )}
        </Reveal>
      </div>
    </section>
  );
}

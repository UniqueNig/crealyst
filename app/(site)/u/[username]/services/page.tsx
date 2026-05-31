import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServices } from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ServiceCard } from "@/components/cards/service-card";
import { CtaSection } from "@/components/sections/cta-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Services — ${username}`,
    description: `Services offered by ${username}.`,
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const services = await getServices(user.id);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
            Services
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Ways I can <span className="text-brand-500">help</span> you ship.
          </h1>
          <p className="mt-6 max-w-xl text-base text-[color:var(--muted)] md:text-lg">
            Engagements range from one-off audits to long-term builds. Pick the
            one that fits — or get in touch and we&apos;ll shape something
            together.
          </p>
        </Reveal>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <StaggerItem key={s.id}>
              <ServiceCard service={s} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <CtaSection username={username} />
    </>
  );
}

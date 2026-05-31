import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/cards/service-card";
import { tenantHref } from "@/lib/tenants";

type Props = { services: Service[]; username: string };

export function ServicesSection({ services, username }: Props) {
  if (services.length === 0) return null;
  const allHref = tenantHref(username, "/services");

  return (
    <section className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/40">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-col gap-12">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Services"
                title={
                  <>
                    What I can{" "}
                    <span className="text-brand-500">create for you</span>
                  </>
                }
                description="From first concept to final files — I help brands and people look their best across print, screen, and everything between."
              />
              <Link
                href={allHref}
                className="group hidden items-center gap-2 text-sm font-medium text-brand-500 hover:underline md:inline-flex"
              >
                See all services
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Reveal>

          <Stagger className="grid gap-5 md:grid-cols-2">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} />
              </StaggerItem>
            ))}
          </Stagger>

          <Link
            href={allHref}
            className="group inline-flex items-center gap-2 self-start text-sm font-medium text-brand-500 hover:underline md:hidden"
          >
            See all services
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { tenantHref } from "@/lib/tenants";

export function CtaSection({ username }: { username: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <div className="glass-panel relative overflow-hidden px-8 py-16 text-center md:px-16 md:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(45,91,255,0.18), transparent 70%)",
            }}
          />
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Have something to bring to life?
            <br />
            <span className="text-brand-500">Let&apos;s create it together.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[color:var(--muted)]">
            I&apos;m taking on new clients and collaborations. Tell me about
            your brand or project — happy to sketch out a direction with you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={tenantHref(username, "/contact")}
              className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Start a project
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

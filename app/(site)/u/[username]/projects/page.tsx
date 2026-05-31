import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Reveal } from "@/components/ui/reveal";
import { ProjectsExplorer } from "./projects-explorer";
import { CtaSection } from "@/components/sections/cta-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Projects — ${username}`,
    description: `Selected projects by ${username}.`,
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const projects = await getProjects(user.id);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
            Selected work
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Projects, in <span className="text-brand-500">detail</span>.
          </h1>
          <p className="mt-6 max-w-xl text-base text-[color:var(--muted)] md:text-lg">
            Each one started as a problem worth solving. Click through for the
            full story — the role I played, the stack I used, and what I
            learned.
          </p>
        </Reveal>

        <ProjectsExplorer projects={projects} username={username} />
      </section>

      <CtaSection username={username} />
    </>
  );
}

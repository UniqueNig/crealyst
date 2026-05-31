import { notFound } from "next/navigation";
import {
  getProfile,
  getSkills,
  getFeaturedServices,
  getFeaturedProjects,
  getExperience,
} from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { Hero } from "@/components/sections/hero";
import { AboutSummary } from "@/components/sections/about-summary";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { CtaSection } from "@/components/sections/cta-section";
import { ContactSection } from "@/components/sections/contact-section";

export default async function TenantHome({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const [profile, skills, services, projects, experience] = await Promise.all([
    getProfile(user.id),
    getSkills(user.id),
    getFeaturedServices(user.id),
    getFeaturedProjects(user.id),
    getExperience(user.id),
  ]);

  return (
    <>
      <Hero profile={profile} username={username} />
      <AboutSummary profile={profile} skills={skills} username={username} />
      <ServicesSection services={services} username={username} />
      <ProjectsSection projects={projects} username={username} />
      <ExperienceSection items={experience} />
      <CtaSection username={username} />
      <ContactSection
        profile={profile}
        username={username}
        isVerified={user.emailVerified}
      />
    </>
  );
}

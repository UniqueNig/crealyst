import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { SKILLS_CATALOG } from "@/lib/skills-catalog";
import { SkillsManager } from "./skills-manager";

export default async function SkillsAdminPage() {
  const session = await verifySession();
  const skills = await prisma.skill.findMany({
    where: { userId: session.sub },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Skills"
        description="Pick from the catalog or add custom ones — these appear in the About section and across project pages."
      />
      <SkillsManager skills={skills} catalog={SKILLS_CATALOG} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ExperienceManager } from "./experience-manager";

export default async function ExperienceAdminPage() {
  const session = await verifySession();
  const items = await prisma.experience.findMany({
    where: { userId: session.sub },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Experience"
        description="Roles and contributions shown in the experience timeline."
      />
      <ExperienceManager items={items} />
    </div>
  );
}

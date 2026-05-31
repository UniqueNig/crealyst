import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { EducationManager } from "./education-manager";

export default async function EducationAdminPage() {
  const session = await verifySession();
  const items = await prisma.education.findMany({
    where: { userId: session.sub },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Education"
        description="Schools and degrees — shown on the /about page and in your downloadable CV."
      />
      <EducationManager items={items} />
    </div>
  );
}

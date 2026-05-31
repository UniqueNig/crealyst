import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { CertificationsManager } from "./certifications-manager";

export default async function CertificationsAdminPage() {
  const session = await verifySession();
  const items = await prisma.certification.findMany({
    where: { userId: session.sub },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Certifications"
        description="Courses, certificates, and credentials — shown on /about and in your downloadable CV."
      />
      <CertificationsManager items={items} />
    </div>
  );
}

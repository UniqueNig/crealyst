import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../../service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const service = await prisma.service.findFirst({
    where: { id, userId: session.sub },
  });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title={`Edit: ${service.title}`} />
      <ServiceForm initial={service} />
    </div>
  );
}

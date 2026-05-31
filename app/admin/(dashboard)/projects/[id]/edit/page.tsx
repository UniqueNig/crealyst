import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "../../project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const project = await prisma.project.findFirst({
    where: { id, userId: session.sub },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title={`Edit: ${project.title}`} />
      <ProjectForm initial={project} />
    </div>
  );
}

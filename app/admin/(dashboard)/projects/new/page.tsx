import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title="New project" />
      <ProjectForm initial={null} />
    </div>
  );
}

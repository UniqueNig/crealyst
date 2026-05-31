import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../service-form";

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title="New service" />
      <ServiceForm initial={null} />
    </div>
  );
}

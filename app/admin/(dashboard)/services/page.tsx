import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/admin/ui/button";
import { ServiceRowActions } from "./service-row-actions";

export default async function ServicesAdminPage() {
  const session = await verifySession();
  const services = await prisma.service.findMany({
    where: { userId: session.sub },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Services"
        description="What you offer — shown on the home page and the /services page."
        actions={
          <Link href="/admin/services/new">
            <Button>
              <Plus size={14} />
              New service
            </Button>
          </Link>
        }
      />

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No services yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  {!s.published && (
                    <span className="rounded-full bg-[color:var(--background)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
                      Draft
                    </span>
                  )}
                  {s.featured && (
                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-500">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {s.description}
                </p>
                <p className="mt-2 font-mono text-[11px] text-[color:var(--muted)]">
                  /{s.slug}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/services/${s.id}/edit`}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </Link>
                <ServiceRowActions id={s.id} title={s.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

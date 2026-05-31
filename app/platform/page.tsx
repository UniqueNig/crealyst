import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { UsersTable } from "./users-table";

async function loadPlatformData() {
  const [users, totals] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        role: true,
        suspendedAt: true,
        suspensionReason: true,
        deletedAt: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            services: true,
            skills: true,
            messages: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.service.count(),
      prisma.contactMessage.count(),
    ]),
  ]);
  return {
    users,
    totals: {
      users: totals[0],
      projects: totals[1],
      services: totals[2],
      messages: totals[3],
    },
  };
}

export default async function PlatformDashboard() {
  const [session, { users, totals }] = await Promise.all([
    verifySession(),
    loadPlatformData(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Platform overview"
        description="Every user on the platform, every piece of content. Treat carefully."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        {(
          [
            { label: "Users", value: totals.users },
            { label: "Projects", value: totals.projects },
            { label: "Services", value: totals.services },
            { label: "Contact messages", value: totals.messages },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
          >
            <p className="font-mono text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <UsersTable users={users} currentUserId={session.sub} />
    </div>
  );
}

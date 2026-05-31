import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { DeleteAccountForm } from "./delete-form";
import { ActivityLog } from "./activity-log";
import { UsernameForm } from "./username-form";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const events = await prisma.accountEvent.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      kind: true,
      ip: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Account"
        description="Email, password, and the danger zone. Profile content lives in Profile."
      />

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <header className="mb-5">
            <h2 className="text-base font-semibold">Username</h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Controls your public URL (<span className="font-mono">/u/{session.username}</span>).
              Once changed, the old URL stops resolving — update any links you&apos;ve shared.
            </p>
          </header>
          <UsernameForm currentUsername={session.username} />
        </section>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <header className="mb-5">
            <h2 className="text-base font-semibold">Email address</h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Used to sign in. Public contact email is set separately under
              Profile.
            </p>
          </header>
          <EmailForm currentEmail={session.email} />
        </section>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <header className="mb-5">
            <h2 className="text-base font-semibold">Password</h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              At least 8 characters. Other devices keep their existing sessions
              for now.
            </p>
          </header>
          <PasswordForm />
        </section>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <header className="mb-5">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Sign-ins and security changes on your account. If you see
              something you didn&apos;t do, change your password now.
            </p>
          </header>
          <ActivityLog events={events} />
        </section>

        <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
          <header className="mb-5">
            <h2 className="text-base font-semibold text-red-500">Danger zone</h2>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Deletes your account and ALL associated data — profile, projects,
              services, experience, education, certifications, messages. This
              cannot be undone.
            </p>
          </header>
          <DeleteAccountForm username={session.username} />
        </section>
      </div>
    </div>
  );
}

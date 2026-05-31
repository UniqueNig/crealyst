import { redirect } from "next/navigation";
import { getSession, getCurrentRole, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UrqlProvider } from "@/components/providers/urql-provider";
import { ToastProvider } from "@/components/admin/ui/toast";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { VerifyEmailBanner } from "@/components/admin/verify-email-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const [role, user] = await Promise.all([
    getCurrentRole(),
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { emailVerified: true, suspendedAt: true, deletedAt: true },
    }),
  ]);

  // If the account was suspended or soft-deleted while the user had an active
  // session, kill the cookie and bounce them. Login will then show the right
  // message via the auth action.
  if (user && (user.suspendedAt || user.deletedAt)) {
    await destroySession();
    redirect(user.deletedAt ? "/login?deactivated=1" : "/login?suspended=1");
  }

  const isOwner = role === "OWNER";
  const needsVerification = user ? !user.emailVerified : false;

  return (
    <UrqlProvider>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar
            email={session.email}
            username={session.username}
            isOwner={isOwner}
          />
          <div className="flex flex-1 flex-col">
            <MobileNav
              email={session.email}
              username={session.username}
              isOwner={isOwner}
            />
            {needsVerification && (
              <VerifyEmailBanner email={session.email} />
            )}
            <div className="flex-1 overflow-x-hidden">{children}</div>
          </div>
        </div>
      </ToastProvider>
    </UrqlProvider>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession, getCurrentRole } from "@/lib/auth";
import { isTenantMode } from "@/lib/tenants";
import { ToastProvider } from "@/components/admin/ui/toast";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Platform",
  robots: { index: false, follow: false },
};

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Platform admin (moderating users, promoting OWNERs) makes no sense on a
  // single-tenant deployment — there's only one user. 404 to keep the route
  // hidden from anyone who tries to navigate to it.
  if (isTenantMode()) notFound();

  const session = await getSession();
  if (!session) redirect("/login?from=/platform");
  const role = await getCurrentRole();
  if (role !== "OWNER") redirect("/admin");

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
            >
              <Shield size={14} className="text-brand-500" />
              platform<span className="text-brand-500">.</span>admin
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted)] hover:border-brand-500/40 hover:text-foreground"
            >
              <ArrowLeft size={12} />
              My dashboard
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}

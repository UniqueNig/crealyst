"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  UserCircle2,
  Sparkles,
  Briefcase,
  FolderKanban,
  Building2,
  GraduationCap,
  Award,
  Inbox,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/auth";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: UserCircle2 },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Building2 },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/account", label: "Account", icon: Settings },
];

type Props = { email: string; username: string; isOwner: boolean };

export function Sidebar({ email, username, isOwner }: Props) {
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const portfolioUrl = `/u/${username}`;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] md:flex">
      <div className="border-b border-[color:var(--border)] px-6 py-5">
        <p className="font-mono text-sm font-semibold tracking-tight">
          {username}<span className="text-brand-500">.</span>admin
        </p>
        <p className="mt-0.5 truncate text-xs text-[color:var(--muted)]">
          {email}
        </p>
        <Link
          href={portfolioUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-500 hover:underline"
        >
          View my portfolio
          <ExternalLink size={10} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-brand-500/10 text-brand-500"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--border)] p-3">
        {isOwner && (
          <Link
            href="/platform"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-500 hover:bg-brand-500/10"
          >
            <Shield size={16} strokeWidth={1.8} />
            Platform admin
          </Link>
        )}
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
        >
          <ExternalLink size={16} strokeWidth={1.8} />
          Marketing home
        </Link>
        <form action={() => start(() => logoutAction())}>
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} strokeWidth={1.8} />
            )}
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

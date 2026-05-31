"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/account", label: "Account" },
];

type Props = { email: string; username: string; isOwner: boolean };

export function MobileNav({ email, username, isOwner }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const pathname = usePathname();
  const portfolioUrl = `/u/${username}`;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 md:hidden">
        <Link
          href="/admin"
          className="font-mono text-sm font-semibold tracking-tight"
        >
          {username}<span className="text-brand-500">.</span>admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--border)]"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.nav
              key="panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[color:var(--border)] bg-[color:var(--background)] md:hidden"
            >
              <div className="border-b border-[color:var(--border)] px-4 py-3">
                <p className="text-xs text-[color:var(--muted)]">
                  Signed in as
                </p>
                <p className="mt-0.5 truncate text-sm">{email}</p>
                <Link
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-500 hover:underline"
                >
                  View my portfolio
                  <ExternalLink size={10} />
                </Link>
              </div>

              <ul className="flex flex-col gap-0.5 p-3">
                {NAV.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-brand-500/10 text-brand-500"
                            : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-[color:var(--border)] p-3">
                {isOwner && (
                  <Link
                    href="/platform"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-500 hover:bg-brand-500/10"
                  >
                    <ExternalLink size={16} strokeWidth={1.8} />
                    Platform admin
                  </Link>
                )}
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-foreground"
                >
                  <ExternalLink size={16} strokeWidth={1.8} />
                  Marketing home
                </Link>
                <form action={() => start(() => logoutAction())}>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
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
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

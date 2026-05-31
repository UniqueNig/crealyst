"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";
import { tenantHref } from "@/lib/tenants";

type Props = { username: string; brand?: string };

const NAV_PATHS = [
  { path: "", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/services", label: "Services" },
  { path: "/projects", label: "Projects" },
  { path: "/contact", label: "Contact" },
];

export function Navbar({ username, brand = "portfolio" }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () =>
      NAV_PATHS.map((n) => ({
        ...n,
        href: tenantHref(username, n.path),
      })),
    [username]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => {
    if (href === "/" || href === `/u/${username}`) {
      return pathname === "/" || pathname === `/u/${username}`;
    }
    return pathname.startsWith(href);
  };

  const homeHref = links[0]?.href ?? "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <div
        className={cn(
          "glass w-full max-w-3xl rounded-2xl transition-all duration-500",
          scrolled || open
            ? "rounded-2xl shadow-[0_12px_48px_-16px_rgba(15,23,42,0.35)]"
            : "rounded-full"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 pl-5 pr-2.5">
          <Link
            href={homeHref}
            className="font-mono text-[15px] font-semibold tracking-tight"
          >
            {brand}<span className="text-brand-500">.</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.path}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--foreground)]/8 text-[color:var(--foreground)]"
                      : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--glass-border)] text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--foreground)]/8 md:hidden"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-[color:var(--glass-border)] px-2.5 pb-2.5 pt-2 md:hidden">
            <ul className="flex flex-col gap-0.5">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.path}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[color:var(--foreground)]/8 text-[color:var(--foreground)]"
                          : "text-[color:var(--muted)] hover:bg-[color:var(--foreground)]/5 hover:text-[color:var(--foreground)]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

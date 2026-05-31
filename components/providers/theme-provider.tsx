"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COOKIE_NAME = "theme";
// 1 year, lax — third-party rendering doesn't need this cookie.
const COOKIE_OPTS = "path=/; max-age=31536000; samesite=lax";

function resolveSystem(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyToDom(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function writeCookie(resolved: ResolvedTheme) {
  document.cookie = `${COOKIE_NAME}=${resolved}; ${COOKIE_OPTS}`;
}

function readPreferenceCookie(): Theme | null {
  // Mirrored as a *separate* cookie so we know whether the user picked
  // "system" (which resolves dynamically) vs. an explicit "light" / "dark".
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)theme-pref=([^;]+)/);
  const value = match?.[1];
  return value === "light" || value === "dark" || value === "system"
    ? value
    : null;
}

function writePreferenceCookie(theme: Theme) {
  document.cookie = `theme-pref=${theme}; ${COOKIE_OPTS}`;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  /** The theme the server rendered the HTML with (from the `theme` cookie). */
  initialTheme: ResolvedTheme;
}) {
  // The user's preference (what they picked in the toggle): light | dark | system.
  // Defaults to "system" so first-time visitors follow OS preference.
  const [theme, setThemeState] = useState<Theme>("system");
  // What's actually applied to <html>. Server already painted with this value.
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>(initialTheme);

  // After hydration, reconcile with the user's stored preference and the OS
  // theme. We don't touch the DOM unless the resolved value differs from
  // what the server painted — keeps the initial paint flash-free.
  useEffect(() => {
    const pref = readPreferenceCookie() ?? "system";
    const next = pref === "system" ? resolveSystem() : pref;
    setThemeState(pref);
    if (next !== resolvedTheme) {
      setResolvedTheme(next);
      applyToDom(next);
      writeCookie(next);
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the user picks "system", re-resolve if the OS theme flips.
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r: ResolvedTheme = mql.matches ? "dark" : "light";
      setResolvedTheme(r);
      applyToDom(r);
      writeCookie(r);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const r: ResolvedTheme = next === "system" ? resolveSystem() : next;
    setThemeState(next);
    setResolvedTheme(r);
    applyToDom(r);
    writeCookie(r);
    writePreferenceCookie(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

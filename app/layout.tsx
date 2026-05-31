import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteName, getSiteTheme } from "@/lib/site";
import { themeCssVars } from "@/lib/themes";
import "./globals.css";

// Urbanist is the site's preferred typeface (geometric, friendly), used for
// everything. Kept under the `--font-geist-sans` var name so globals.css
// `--font-sans` (and now `--font-mono`) need no change.
const urbanist = Urbanist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Root-level defaults for system chrome — login / password reset / email verify
// / welcome / admin / 404. The public portfolio pages override these via their
// own generateMetadata in app/(site)/u/[username]/layout.tsx, so visitors of a
// portfolio see the owner's name and details, not these fallbacks.
//
// Single-tenant deployment: the "site name" is the portfolio owner's name
// (resolved from his profile), so the browser tab on these pages reads e.g.
// "Sign in — <Owner>" rather than carrying any product branding.
export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  const description = `${siteName} — portfolio, projects, and contact.`;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName,
      title: siteName,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the user's theme preference from the cookie set by ThemeProvider.
  // Resolving server-side means the initial HTML already has the right
  // `.dark` / `.light` class — no client script, no flash, no React 19
  // <script> warning. For first-time visitors with no cookie we default to
  // `dark`; the provider will flip to system preference after hydration if
  // they haven't explicitly chosen.
  const cookieStore = await cookies();
  const stored = cookieStore.get("theme")?.value;
  const resolved =
    stored === "light" || stored === "dark" ? stored : "dark";

  // Apply the owner's chosen accent/gradient at the root so EVERY page — login,
  // password reset, welcome, 404, admin, and the public portfolio — uses the
  // same brand color. (The public /u/<name> subtree re-applies its own, which
  // for this single-tenant deployment resolves to the same theme.)
  const theme = await getSiteTheme();
  const themeCss = themeCssVars(theme?.key);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable} h-full antialiased ${resolved}`}
      style={{ colorScheme: resolved }}
    >
      <body
        data-portfolio-theme={theme?.key ?? "default"}
        className="min-h-full bg-background text-foreground"
      >
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
        <ThemeProvider initialTheme={resolved}>{children}</ThemeProvider>
      </body>
    </html>
  );
}

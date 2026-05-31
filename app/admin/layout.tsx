import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";
import { resolveTheme, themeCssVars } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mirror the public portfolio: apply the owner's chosen accent to the admin
  // UI too, so every `brand-*` utility in the dashboard matches the theme they
  // picked for their site (and its gradient).
  const session = await getSession();
  const profile = session ? await getProfile(session.sub) : null;
  const theme = resolveTheme(profile?.accent);
  const themeCss = themeCssVars(profile?.accent);

  return (
    <div
      data-portfolio-theme={theme?.key ?? "default"}
      className="min-h-screen bg-background text-foreground"
    >
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      {children}
    </div>
  );
}

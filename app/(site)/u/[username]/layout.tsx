import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { TrackView } from "@/components/analytics/track-view";
import { getUserByUsername } from "@/lib/data/user";
import { getProfile } from "@/lib/data/profile";
import { resolveTheme, themeCssVars } from "@/lib/themes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Per-user metadata. Overrides the root layout's defaults so the browser tab,
 * link previews on Twitter / LinkedIn / Slack, and search snippets all show
 * the portfolio's owner — not the SaaS operator.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const profile = await getProfile(user.id);

  const displayName = profile?.name?.trim() || `@${username}`;
  const title = profile?.title?.trim()
    ? `${displayName} — ${profile.title}`
    : displayName;
  const description =
    profile?.tagline?.trim() ||
    profile?.bio?.trim().slice(0, 160) ||
    `${displayName}'s portfolio — projects, services, and contact.`;
  const url = `${siteUrl}/u/${username}`;

  return {
    // `default` is what shows on /u/<name>; `template` is used when a child
    // page (e.g. a project case study) sets its own title — so a project tab
    // reads "My Project — Jane Doe" instead of inheriting the SaaS template.
    title: {
      default: title,
      template: `%s — ${displayName}`,
    },
    description,
    alternates: { canonical: url },
    keywords: [displayName, profile?.title ?? "", "Portfolio", "Builder"]
      .filter(Boolean) as string[],
    authors: [{ name: displayName }],
    creator: displayName,
    openGraph: {
      type: "profile",
      locale: "en_US",
      url,
      siteName: displayName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const profile = await getProfile(user.id);

  const brand = profile?.name?.split(" ")[0]?.toLowerCase() ?? username;
  const socials = {
    github: profile?.github,
    linkedin: profile?.linkedin,
    twitter: profile?.twitter,
    email: profile?.email,
  };
  const theme = resolveTheme(profile?.accent);
  const themeCss = themeCssVars(profile?.accent);

  return (
    <div data-portfolio-theme={theme?.key ?? "default"}>
      {themeCss && (
        // The override sets --color-brand-* on the matching data attribute,
        // so every `bg-brand-500` / `text-brand-500` inside this subtree
        // resolves to the user's chosen palette via the CSS cascade.
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      )}
      <TrackView username={username} />
      <Navbar username={username} brand={brand} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer username={username} brand={brand} socials={socials} />
      <BackToTop />
    </div>
  );
}

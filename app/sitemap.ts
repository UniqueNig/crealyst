import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllProjectSlugs } from "@/lib/data/profile";
import { getUserByUsername } from "@/lib/data/user";
import { getTenantUsername, isTenantMode } from "@/lib/tenants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Regenerate at most every 60s. Search engines crawl sitemaps occasionally,
// so a tiny soft cache prevents request bursts from hitting the DB twice
// while still letting newly-signed-up users appear within a minute.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  if (isTenantMode()) {
    const tenant = getTenantUsername();
    if (!tenant) return [];
    const user = await getUserByUsername(tenant);
    if (!user) return [];
    const projects = await getAllProjectSlugs(user.id);
    const root: MetadataRoute.Sitemap = [
      { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
      { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
      { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    ];
    const slugs: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    return [...root, ...slugs];
  }

  // SaaS mode: marketing root + every public portfolio + its projects.
  // Suspended and soft-deleted users are dropped — filtered in JS rather than
  // in the where clause because Prisma + MongoDB doesn't reliably match `null`
  // against documents missing the field entirely (pre-migration accounts).
  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      suspendedAt: true,
      deletedAt: true,
      projects: { where: { published: true }, select: { slug: true } },
    },
  });
  const users = allUsers.filter((u) => !u.suspendedAt && !u.deletedAt);

  const marketing: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const tenantRoutes: MetadataRoute.Sitemap = users.flatMap((u) => {
    const base = `${siteUrl}/u/${u.username}`;
    const pages: MetadataRoute.Sitemap = [
      { url: base, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    ];
    const projects: MetadataRoute.Sitemap = u.projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    return [...pages, ...projects];
  });

  return [...marketing, ...tenantRoutes];
}

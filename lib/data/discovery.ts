import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DiscoveryPortfolio = {
  id: string;
  username: string;
  joinedAt: Date;
  name: string;
  title: string;
  tagline: string;
  location: string | null;
  avatarUrl: string | null;
  accent: string | null;
  projectCount: number;
};

/**
 * Public portfolio listing for /explore. Only includes accounts that are:
 *   - active (not suspended, not soft-deleted)
 *   - have filled in the basics (name + title + tagline)
 *
 * Cached for 5 minutes — discovery pages don't need real-time freshness,
 * and this query joins across users + profiles + project counts. Revalidate
 * via the `discovery` tag if you need to bust it sooner (e.g. after a major
 * launch / moderation action).
 */
export const getPublicPortfolios = unstable_cache(
  async (): Promise<DiscoveryPortfolio[]> => {
    const users = await prisma.user.findMany({
      // We DON'T filter suspendedAt/deletedAt in the where clause here because
      // Prisma + MongoDB doesn't reliably match `null` against documents that
      // are missing the field entirely (pre-migration accounts). We fetch all
      // and filter in JS — cheap at our scale.
      where: { profile: { isNot: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        createdAt: true,
        suspendedAt: true,
        deletedAt: true,
        profile: {
          select: {
            name: true,
            title: true,
            tagline: true,
            location: true,
            avatarUrl: true,
            accent: true,
          },
        },
        _count: {
          select: { projects: { where: { published: true } } },
        },
      },
    });

    return users
      .filter(
        (u) =>
          !u.suspendedAt &&
          !u.deletedAt &&
          u.profile &&
          u.profile.name.trim() !== "" &&
          u.profile.title.trim() !== "" &&
          u.profile.tagline.trim() !== ""
      )
      .map((u) => ({
        id: u.id,
        username: u.username,
        joinedAt: u.createdAt,
        name: u.profile!.name,
        title: u.profile!.title,
        tagline: u.profile!.tagline,
        location: u.profile!.location,
        avatarUrl: u.profile!.avatarUrl,
        accent: u.profile!.accent,
        projectCount: u._count.projects,
      }));
  },
  ["public-portfolios"],
  { tags: ["discovery"], revalidate: 300 }
);

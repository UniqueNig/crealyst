import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";

/**
 * Look up a public user record by URL-safe username. Returns null for
 * unknown, suspended, or soft-deleted users so the caller can render a 404.
 * Cached briefly so back-to-back navigations don't re-hit the DB.
 *
 * Moderation note: filtering at this single chokepoint is what makes the
 * portfolio go dark when a user is suspended — every public page resolves the
 * user through here, so they all 404 together. Invalidating the `user:<name>`
 * tag on state change cuts the up-to-60-second stale window.
 */
export function getUserByUsername(username: string) {
  return unstable_cache(
    async () => {
      // Why two-step: Prisma + MongoDB has flaky semantics matching `null`
      // against documents where the field is MISSING entirely (e.g. users
      // created before the moderation fields existed). Filtering in JS after
      // a plain findUnique avoids the issue and is just as fast for a single
      // record.
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          suspendedAt: true,
          deletedAt: true,
        },
      });
      if (!user) return null;
      if (user.suspendedAt || user.deletedAt) return null;
      // Strip moderation fields from the returned shape so callers don't
      // accidentally start depending on them.
      const { suspendedAt: _s, deletedAt: _d, ...publicUser } = user;
      return publicUser;
    },
    [`user-by-username:${username}`],
    { tags: [`user:${username}`], revalidate: 60 }
  )();
}

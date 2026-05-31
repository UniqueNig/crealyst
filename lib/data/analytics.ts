import "server-only";
import { prisma } from "@/lib/prisma";

export type AnalyticsSnapshot = {
  windowDays: number;
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
};

/**
 * Roll up the user's portfolio views over the trailing N days.
 * Returns totals plus the top 5 pages and top 5 external referrers. Self-
 * referrers are already filtered at write time, so anything in topReferrers
 * came from elsewhere on the web.
 */
export async function getAnalyticsSnapshot(
  userId: string,
  windowDays = 30
): Promise<AnalyticsSnapshot> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  // Single fetch + group in memory. At small scale this is cheaper than two
  // groupBy queries against MongoDB; we can revisit if rows ever get into the
  // hundreds of thousands per user.
  const views = await prisma.pageView.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { path: true, visitorId: true, referrer: true },
  });

  const pathCounts = new Map<string, number>();
  const refCounts = new Map<string, number>();
  const uniqueVisitors = new Set<string>();

  for (const v of views) {
    pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
    if (v.visitorId) uniqueVisitors.add(v.visitorId);
    if (v.referrer) {
      // Group by host so /search?q=... and /search?q=other count together.
      let host = v.referrer;
      try {
        host = new URL(v.referrer).host;
      } catch {
        /* keep raw referrer when it's not parseable */
      }
      refCounts.set(host, (refCounts.get(host) ?? 0) + 1);
    }
  }

  const topPages = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  const topReferrers = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, views]) => ({ referrer, views }));

  return {
    windowDays,
    totalViews: views.length,
    uniqueVisitors: uniqueVisitors.size,
    topPages,
    topReferrers,
  };
}

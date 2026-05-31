import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Hash an IP + user-agent + a daily salt to produce a stable visitor id that
 * rotates each UTC day. Lets us count unique visitors WITHOUT keeping raw IPs
 * and prevents long-term tracking across days.
 */
function makeVisitorId(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // AUTH_SECRET doubles as the salt — it's already a 32+ char random string
  // every deployment is required to have, so we don't need a separate env var.
  const salt = process.env.AUTH_SECRET ?? "fallback-dev-salt";
  return createHash("sha256")
    .update(`${day}|${ip}|${ua}|${salt}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Strip and cap a referrer header so we don't store unbounded URLs. Same-origin
 * referrers are dropped because they're just the user clicking around their own
 * portfolio — not interesting traffic-source data.
 */
function normalizeReferrer(
  referrer: string | null,
  ownHost: string | null
): string | null {
  if (!referrer) return null;
  const trimmed = referrer.trim();
  if (!trimmed) return null;
  if (ownHost) {
    try {
      const u = new URL(trimmed);
      if (u.host === ownHost) return null;
    } catch {
      // not a parsable URL — keep as-is, capped
    }
  }
  return trimmed.slice(0, 500);
}

export type TrackViewInput = {
  username: string;
  path: string;
  ip: string;
  userAgent: string;
  referrer: string | null;
  country: string | null;
  ownHost: string | null;
};

/**
 * Pull a project slug out of the path so we can attribute views to specific
 * projects. Matches both URL forms:
 *   - SaaS:   /u/<user>/projects/<slug>
 *   - Tenant: /projects/<slug>
 */
function extractProjectSlug(path: string): string | null {
  const m = path.match(/^(?:\/u\/[^/]+)?\/projects\/([^/?#]+)\/?$/);
  return m?.[1] ?? null;
}

/**
 * Record one page view. Looks up the userId from the username so the client
 * can't spoof someone else's account — and resolves the projectId when the
 * path is a project page.
 */
export async function trackPageView(input: TrackViewInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true },
  });
  if (!user) return;

  const projectSlug = extractProjectSlug(input.path);
  let projectId: string | null = null;
  if (projectSlug) {
    const project = await prisma.project.findFirst({
      where: { userId: user.id, slug: projectSlug },
      select: { id: true },
    });
    projectId = project?.id ?? null;
  }

  // Truncate the path so freeform URLs (e.g. attackers POSTing junk) can't
  // bloat the row.
  const path = input.path.slice(0, 200);

  await prisma.pageView.create({
    data: {
      userId: user.id,
      path,
      projectId,
      visitorId: makeVisitorId(input.ip, input.userAgent),
      referrer: normalizeReferrer(input.referrer, input.ownHost),
      country: input.country?.slice(0, 4) ?? null,
    },
  });
}

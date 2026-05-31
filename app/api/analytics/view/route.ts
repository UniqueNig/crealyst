import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/request-ip";
import { trackPageView } from "@/lib/analytics/track";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/analytics/view
 * Body: { username: string, path: string, projectSlug?: string }
 *
 * Called once per portfolio page load from the client beacon. Returns 204 No
 * Content immediately to keep it cheap on the client. We DO NOT trust a
 * client-supplied userId — the server looks up the user from the username so
 * a malicious caller can only spam views for a real account, not invent one.
 */
export async function POST(request: NextRequest) {
  const ip = await getClientIp();

  // Cheap abuse cap: ~120 view writes/min per IP. Real visitors trigger one
  // per navigation, so this only bites bots / scripted clients.
  const limit = checkRateLimit(`analytics:${ip}`, 120, 60);
  if (!limit.ok) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const data = body as { username?: string; path?: string };

  if (
    !data ||
    typeof data.username !== "string" ||
    typeof data.path !== "string"
  ) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const h = await headers();
  const userAgent = h.get("user-agent") ?? "";
  const referrer = h.get("referer");
  // Vercel injects x-vercel-ip-country. Free signal, missing locally.
  const country = h.get("x-vercel-ip-country");
  // Used to drop self-referrers when collecting traffic-source data.
  const ownHost = h.get("host");

  // Fire-and-forget: never block the response on the DB write. Errors are
  // swallowed (just logged) — losing a view is preferable to slowing visitors.
  void trackPageView({
    username: data.username,
    path: data.path,
    ip,
    userAgent,
    referrer,
    country,
    ownHost,
  }).catch((e) => {
    console.error("[analytics] failed to record view", e);
  });

  return new NextResponse(null, { status: 204 });
}

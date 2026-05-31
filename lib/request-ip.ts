import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client IP detection from request headers. Returns a stable
 * placeholder ("anonymous") if no proxy-forwarded headers are present —
 * meaning rate limits won't be enforced per-IP for direct connections.
 *
 * On Vercel, `x-forwarded-for` is always set. The first IP in the
 * comma-separated list is the original client.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

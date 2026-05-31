/**
 * Satori (the engine behind `next/og`'s ImageResponse) only accepts absolute
 * URLs for `<img src>`. If the stored avatar is a relative public path like
 * `/me.jpg`, we resolve it against NEXT_PUBLIC_SITE_URL so the rendered icon
 * / OG card can fetch it. Returns null when the input isn't usable so the
 * caller can fall back to a generated initial-based avatar.
 */
export function absoluteAvatarUrl(
  avatarUrl: string | null | undefined
): string | null {
  if (!avatarUrl) return null;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) {
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
    return `${siteUrl}${trimmed}`;
  }
  return null;
}

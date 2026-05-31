import { ImageResponse } from "next/og";
import { getUserByUsername } from "@/lib/data/user";
import { getProfile } from "@/lib/data/profile";
import { resolveTheme } from "@/lib/themes";
import { absoluteAvatarUrl } from "@/lib/og-helpers";

const DEFAULT_ACCENT = "#2d5bff";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

function initial(name: string): string {
  const first = name.trim().split(/\s+/)[0]?.[0];
  return (first ?? "?").toUpperCase();
}

/**
 * Cache-busting trick: the `id` we return here becomes part of the icon's
 * generated URL (e.g. /u/<user>/icon-<hash>/<id>). When the user updates their
 * profile (avatar, name, accent), `profile.updatedAt` bumps → id changes →
 * URL changes → browser refetches. Without this, browsers cache the favicon
 * URL forever and a new avatar would never show up in the tab.
 */
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  // During build / page-data collection Next can call this with a placeholder
  // value, so guard the DB lookup or it'll throw a Prisma "no where args" error.
  if (!username) return [{ id: "0", size, contentType }];
  try {
    const user = await getUserByUsername(username);
    const profile = user ? await getProfile(user.id) : null;
    // unstable_cache returns updatedAt as a string after JSON round-trip,
    // so coerce to Date before calling .getTime().
    const version = profile?.updatedAt
      ? new Date(profile.updatedAt).getTime()
      : 0;
    return [{ id: String(version), size, contentType }];
  } catch {
    return [{ id: "0", size, contentType }];
  }
}

/**
 * Per-user favicon. Uses the user's avatar when they've uploaded one (so each
 * portfolio's browser tab shows their face) — falls back to a single-letter
 * disc in their accent color when no avatar is set.
 *
 * Lives at /u/[username]/icon.tsx, which Next.js auto-mounts at
 * <link rel="icon"> for every route under that segment.
 */
export default async function Icon({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const profile = user ? await getProfile(user.id) : null;

  const name = profile?.name?.trim() || username;
  const theme = resolveTheme(profile?.accent);
  const accent = theme?.scale[500] ?? DEFAULT_ACCENT;
  const avatarUrl = absoluteAvatarUrl(profile?.avatarUrl);

  if (avatarUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: accent,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            width={size.width}
            height={size.height}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt=""
          />
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent,
          color: "white",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 4,
        }}
      >
        {initial(name)}
      </div>
    ),
    { ...size }
  );
}

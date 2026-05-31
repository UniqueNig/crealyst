import { ImageResponse } from "next/og";
import { getUserByUsername } from "@/lib/data/user";
import { getProfile } from "@/lib/data/profile";
import { resolveTheme } from "@/lib/themes";
import { absoluteAvatarUrl } from "@/lib/og-helpers";

const DEFAULT_ACCENT = "#2d5bff";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

// See icon.tsx for the cache-busting rationale.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!username) return [{ id: "0", size, contentType }];
  try {
    const user = await getUserByUsername(username);
    const profile = user ? await getProfile(user.id) : null;
    const version = profile?.updatedAt
      ? new Date(profile.updatedAt).getTime()
      : 0;
    return [{ id: String(version), size, contentType }];
  } catch {
    return [{ id: "0", size, contentType }];
  }
}

/**
 * 180×180 Apple touch icon. Mirrors icon.tsx — prefer the user's avatar when
 * they have one, fall back to initials on accent-colored disc.
 */
export default async function AppleIcon({
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
            borderRadius: 32,
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
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 32,
        }}
      >
        {initials(name)}
      </div>
    ),
    { ...size }
  );
}

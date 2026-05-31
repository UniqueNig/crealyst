import { ImageResponse } from "next/og";
import { getUserByUsername } from "@/lib/data/user";
import { getProfile } from "@/lib/data/profile";
import { resolveTheme } from "@/lib/themes";
import { absoluteAvatarUrl } from "@/lib/og-helpers";

// Default OG card colors. Overridden by the user's accent when set.
const DEFAULT_ACCENT = "#2d5bff";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
}

// See icon.tsx — cache-bust the OG image URL when the user's profile changes
// so Twitter / LinkedIn / Slack pick up fresh previews after edits.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!username) return [{ id: "0", size, alt, contentType }];
  try {
    const user = await getUserByUsername(username);
    const profile = user ? await getProfile(user.id) : null;
    // unstable_cache serializes Date → string on its way out, so we have to
    // coerce before calling .getTime().
    const version = profile?.updatedAt
      ? new Date(profile.updatedAt).getTime()
      : 0;
    return [{ id: String(version), size, alt, contentType }];
  } catch {
    return [{ id: "0", size, alt, contentType }];
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  // Generate something even for unknown users so we never serve a stale or
  // wrong OG card from a CDN intermediary.
  const profile = user ? await getProfile(user.id) : null;

  const name = profile?.name?.trim() || `@${username}`;
  const title = profile?.title?.trim() || "Portfolio";
  const tagline =
    profile?.tagline?.trim() ||
    profile?.bio?.trim().slice(0, 140) ||
    "Portfolio";
  const theme = resolveTheme(profile?.accent);
  const accent = theme?.scale[500] ?? DEFAULT_ACCENT;
  const avatarUrl = absoluteAvatarUrl(profile?.avatarUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          color: "#f7f7f8",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#87878f",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: accent,
            }}
          />
          /u/{username}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 999,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                width={140}
                height={140}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt=""
              />
            ) : (
              initials(name)
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 72,
                lineHeight: 1.05,
                fontWeight: 600,
                letterSpacing: -2,
                maxWidth: 800,
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: 30, color: accent }}>{title}</div>
          </div>
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#b1b1b9",
            maxWidth: 1000,
            lineHeight: 1.35,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}

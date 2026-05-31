import { ImageResponse } from "next/og";
import { getSiteName } from "@/lib/site";

const ACCENT = "#2d5bff";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Root OG card — used on system routes (/, /login, /admin, etc.). Single-tenant
 * deployment, so it reflects the owner's name. Portfolio pages at /u/<username>
 * have their own richer OG card generated from the profile.
 */
export default async function OpengraphImage() {
  const name = await getSiteName();
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
            fontSize: 26,
            color: "#b1b1b9",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: ACCENT,
            }}
          />
          <span>Portfolio</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 32, color: ACCENT, maxWidth: 900 }}>
            Selected work, services, and contact.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#87878f",
          }}
        >
          <span>Projects · Services · Contact</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

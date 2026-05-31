import { ImageResponse } from "next/og";
import { getSiteInitial } from "@/lib/site";

const ACCENT = "#2d5bff";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * 180×180 Apple touch icon — the owner's initial on the brand accent.
 * Mirrors icon.tsx for iOS home-screen pins on non-tenant routes.
 */
export default async function AppleIcon() {
  const initial = await getSiteInitial();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
          color: "white",
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 32,
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}

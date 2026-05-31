import { ImageResponse } from "next/og";
import { getSiteInitial } from "@/lib/site";

const ACCENT = "#2d5bff";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Root favicon — the owner's initial on the brand accent. Shown on login,
 * /admin, /welcome and other system routes that have no per-user context.
 * Tenant portfolios at /u/<name> have their own icon.tsx that overrides this.
 */
export default async function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 4,
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}

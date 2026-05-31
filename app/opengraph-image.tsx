import { ImageResponse } from "next/og";

const ACCENT = "#2d5bff";

export const alt = "Folonest — Your portfolio finds its home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Root OG card for the SaaS marketing surface — used on /, /login, /signup,
 * /explore, etc. Tenant portfolios at /u/<username> have their own OG card
 * generated from each user's profile.
 */
export default function OpengraphImage() {
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
          <span style={{ fontFamily: "monospace" }}>folonest</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
            }}
          >
            Your portfolio
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
              color: ACCENT,
            }}
          >
            finds its home.
          </div>
          <div style={{ fontSize: 32, color: "#b1b1b9", maxWidth: 900 }}>
            A beautiful, SEO-friendly portfolio with a built-in admin panel.
            No code. No redeploys.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#87878f",
          }}
        >
          <span>Projects · Services · Contact form</span>
          <span>↗ Get started free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

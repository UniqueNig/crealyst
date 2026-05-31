/**
 * Per-portfolio theme presets. Each preset is a full 50–900 scale so the
 * tenant layout can override `--color-brand-*` on its subtree and every
 * `brand-500` / `brand-600` utility used across the public site picks up the
 * new color via the CSS cascade. Tailwind 4 utilities resolve to
 * `var(--color-brand-XXX)` so the override is purely a runtime CSS thing —
 * no rebuild needed.
 *
 * Presets come in two flavors:
 *  - solid: a single hue scale (Default, Emerald, Sky, …)
 *  - gradient: a hue scale PLUS a `gradient` (from→to) that drives the
 *    `--brand-gradient` CSS var used by `.text-gradient-brand` /
 *    `.bg-gradient-brand` (hero name, primary CTAs, etc.)
 *
 * The "default" key matches the values in globals.css. When a user has no
 * `accent` set (or an unknown one), we render nothing and inherit the root.
 */

export type ThemeKey =
  | "default"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "teal"
  | "slate"
  | "sky"
  | "indigo"
  | "fuchsia"
  | "orange"
  | "cyan"
  | "lime"
  | "red"
  // gradient presets
  | "sunset"
  | "ocean"
  | "aurora"
  | "candy"
  | "fire"
  | "midnight";

export type ThemeScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export type ThemePreset = {
  key: ThemeKey;
  label: string;
  // Used as the swatch fill in the picker and the inline override on /u/<name>.
  scale: ThemeScale;
  // Optional two-stop gradient. When set, overrides `--brand-gradient` for the
  // portfolio and the picker swatch renders the gradient instead of a solid.
  gradient?: { from: string; to: string };
};

// Reusable hue scales (Tailwind palettes) so gradient presets can borrow a
// representative solid scale for the `brand-*` utilities.
const SCALES = {
  blue: { 50: "#ebf0ff", 100: "#d6e0ff", 200: "#adc1ff", 300: "#84a2ff", 400: "#5683ff", 500: "#2d5bff", 600: "#1f47e0", 700: "#1736b0", 800: "#0f2780", 900: "#081854" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337" },
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a" },
  slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" },
  sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" },
  fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63" },
  lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d" },
} satisfies Record<string, ThemeScale>;

export const THEMES: ThemePreset[] = [
  // ─── Solid ────────────────────────────────────────────────────────────
  { key: "default", label: "Default", scale: SCALES.blue },
  { key: "emerald", label: "Emerald", scale: SCALES.emerald },
  { key: "teal", label: "Teal", scale: SCALES.teal },
  { key: "cyan", label: "Cyan", scale: SCALES.cyan },
  { key: "sky", label: "Sky", scale: SCALES.sky },
  { key: "indigo", label: "Indigo", scale: SCALES.indigo },
  { key: "violet", label: "Violet", scale: SCALES.violet },
  { key: "fuchsia", label: "Fuchsia", scale: SCALES.fuchsia },
  { key: "rose", label: "Rose", scale: SCALES.rose },
  { key: "red", label: "Red", scale: SCALES.red },
  { key: "orange", label: "Orange", scale: SCALES.orange },
  { key: "amber", label: "Amber", scale: SCALES.amber },
  { key: "lime", label: "Lime", scale: SCALES.lime },
  { key: "slate", label: "Slate", scale: SCALES.slate },

  // ─── Gradient ───────────────────────────────────────────────────────────
  { key: "sunset", label: "Sunset", scale: SCALES.orange, gradient: { from: "#f59e0b", to: "#f43f5e" } },
  { key: "fire", label: "Fire", scale: SCALES.red, gradient: { from: "#f97316", to: "#dc2626" } },
  { key: "ocean", label: "Ocean", scale: SCALES.sky, gradient: { from: "#2d5bff", to: "#14b8a6" } },
  { key: "aurora", label: "Aurora", scale: SCALES.violet, gradient: { from: "#8b5cf6", to: "#14b8a6" } },
  { key: "candy", label: "Candy", scale: SCALES.fuchsia, gradient: { from: "#d946ef", to: "#38bdf8" } },
  { key: "midnight", label: "Midnight", scale: SCALES.indigo, gradient: { from: "#4f46e5", to: "#8b5cf6" } },
];

const THEME_BY_KEY = new Map(THEMES.map((t) => [t.key, t]));

export function resolveTheme(accent: string | null | undefined): ThemePreset | null {
  if (!accent) return null;
  return THEME_BY_KEY.get(accent as ThemeKey) ?? null;
}

/** The CSS `linear-gradient(...)` for a preset's gradient, or null. */
export function themeGradientCss(theme: ThemePreset | null): string | null {
  if (!theme?.gradient) return null;
  return `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`;
}

/**
 * CSS string that overrides the `--color-brand-*` variables (and, for gradient
 * presets, `--brand-gradient`) for a single subtree. Returns empty string when
 * no theme is set, so the caller can drop it into a `<style>` tag
 * unconditionally.
 */
export function themeCssVars(accent: string | null | undefined): string {
  const theme = resolveTheme(accent);
  if (!theme || theme.key === "default") return "";
  const lines = Object.entries(theme.scale)
    .map(([step, hex]) => `  --color-brand-${step}: ${hex};`)
    .join("\n");
  const gradient = themeGradientCss(theme);
  const gradientLine = gradient ? `\n  --brand-gradient: ${gradient};` : "";
  return `[data-portfolio-theme="${theme.key}"] {\n${lines}${gradientLine}\n}`;
}

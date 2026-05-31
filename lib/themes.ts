/**
 * Per-portfolio theme presets. Each preset is a full 50–900 scale so the
 * tenant layout can override `--color-brand-*` on its subtree and every
 * `brand-500` / `brand-600` utility used across the public site picks up the
 * new color via the CSS cascade. Tailwind 4 utilities resolve to
 * `var(--color-brand-XXX)` so the override is purely a runtime CSS thing —
 * no rebuild needed.
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
  | "slate";

export type ThemePreset = {
  key: ThemeKey;
  label: string;
  // Used as the swatch fill in the picker and the inline override on /u/<name>.
  scale: {
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
};

export const THEMES: ThemePreset[] = [
  {
    key: "default",
    label: "Default",
    scale: {
      50: "#ebf0ff",
      100: "#d6e0ff",
      200: "#adc1ff",
      300: "#84a2ff",
      400: "#5683ff",
      500: "#2d5bff",
      600: "#1f47e0",
      700: "#1736b0",
      800: "#0f2780",
      900: "#081854",
    },
  },
  {
    key: "emerald",
    label: "Emerald",
    scale: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
  },
  {
    key: "amber",
    label: "Amber",
    scale: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
  },
  {
    key: "rose",
    label: "Rose",
    scale: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
    },
  },
  {
    key: "violet",
    label: "Violet",
    scale: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
  },
  {
    key: "teal",
    label: "Teal",
    scale: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
    },
  },
  {
    key: "slate",
    label: "Slate",
    scale: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
];

const THEME_BY_KEY = new Map(THEMES.map((t) => [t.key, t]));

export function resolveTheme(accent: string | null | undefined): ThemePreset | null {
  if (!accent) return null;
  return THEME_BY_KEY.get(accent as ThemeKey) ?? null;
}

/**
 * CSS string that overrides the `--color-brand-*` variables for a single
 * subtree. Returns empty string when no theme is set, so the caller can drop
 * it into a `<style>` tag unconditionally.
 */
export function themeCssVars(accent: string | null | undefined): string {
  const theme = resolveTheme(accent);
  if (!theme || theme.key === "default") return "";
  const lines = Object.entries(theme.scale)
    .map(([step, hex]) => `  --color-brand-${step}: ${hex};`)
    .join("\n");
  return `[data-portfolio-theme="${theme.key}"] {\n${lines}\n}`;
}

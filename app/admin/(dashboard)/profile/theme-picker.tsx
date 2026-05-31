"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  THEMES,
  themeGradientCss,
  type ThemeKey,
  type ThemePreset,
} from "@/lib/themes";
import { updateAccentAction, type ThemeState } from "@/lib/actions/theme";
import { useToast } from "@/components/admin/ui/toast";

const initial: ThemeState = { status: "idle" };

export function ThemePicker({
  currentAccent,
  username,
}: {
  currentAccent: ThemeKey;
  username: string;
}) {
  const [state, formAction] = useActionState(updateAccentAction, initial);
  const [optimistic, setOptimistic] = useState<ThemeKey>(currentAccent);
  const [pending, start] = useTransition();
  const { show } = useToast();
  const router = useRouter();

  const onPick = (key: ThemeKey) => {
    if (key === optimistic) return;
    setOptimistic(key);
    const fd = new FormData();
    fd.set("accent", key);
    start(async () => {
      const result = await updateAccentAction(state, fd);
      if (result.status === "error") {
        show("error", result.message);
        // Roll back the swatch to whatever the server thinks is current.
        setOptimistic(currentAccent);
      } else if (result.status === "success") {
        show("success", "Theme saved.");
        router.refresh();
      }
    });
  };

  // Render via a form too, in case JS is disabled — the optimistic UI is
  // progressive enhancement, not the only path.
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            Theme
          </h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Pick an accent color for your public portfolio. Saves instantly.
          </p>
        </div>
        <Link
          href={`/u/${username}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted)] hover:border-brand-500/40 hover:text-foreground"
        >
          Preview live
          <ExternalLink size={12} />
        </Link>
      </div>

      <form action={formAction} className="flex flex-wrap gap-3">
        {THEMES.map((t) => (
          <ThemeSwatch
            key={t.key}
            theme={t}
            selected={optimistic === t.key}
            disabled={pending}
            onClick={() => onPick(t.key)}
          />
        ))}
        {/* Hidden input keeps the form submittable for noscript users. */}
        <input type="hidden" name="accent" value={optimistic} />
      </form>

      <p className="text-[11px] text-[color:var(--muted)]">
        Currently:{" "}
        <span className="font-medium text-foreground">
          {THEMES.find((t) => t.key === optimistic)?.label}
        </span>
      </p>
    </section>
  );
}

function ThemeSwatch({
  theme,
  selected,
  disabled,
  onClick,
}: {
  theme: ThemePreset;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const gradient = themeGradientCss(theme);
  const fill: React.CSSProperties = gradient
    ? { backgroundImage: gradient }
    : { backgroundColor: theme.scale[500] };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Use ${theme.label} theme`}
      className={
        "group relative flex size-12 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-60 " +
        (selected
          ? "ring-2 ring-offset-2 ring-offset-[color:var(--surface)]"
          : "hover:scale-105")
      }
      style={
        selected
          ? ({ ...fill, "--tw-ring-color": theme.scale[500] } as React.CSSProperties)
          : fill
      }
    >
      {selected && <Check size={16} className="text-white" strokeWidth={3} />}
      <span className="sr-only">{theme.label}</span>
      <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[color:var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
        {theme.label}
      </span>
    </button>
  );
}

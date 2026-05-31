import {
  Check,
  Code2,
  Compass,
  Server,
  Sparkles,
  Palette,
  PenTool,
  Layout,
  Film,
  Camera,
  Megaphone,
  Brush,
  Shapes,
  Type,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import type { Service } from "@prisma/client";
import { cn } from "@/lib/cn";

const ICON_MAP = {
  Code2,
  Server,
  Sparkles,
  Compass,
  Palette,
  PenTool,
  Layout,
  Film,
  Camera,
  Megaphone,
  Brush,
  Shapes,
  Type,
  Image: ImageIcon,
  Package,
} as const;

type Props = { service: Service; className?: string };

export function ServiceCard({ service, className }: Props) {
  const Icon =
    service.icon && service.icon in ICON_MAP
      ? ICON_MAP[service.icon as keyof typeof ICON_MAP]
      : Sparkles;

  return (
    <article
      className={cn(
        "glass-panel glass-hover group relative flex flex-col gap-4 overflow-hidden p-6",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <h3 className="text-xl font-semibold leading-snug tracking-tight">
        {service.title}
      </h3>
      <p className="text-sm text-[color:var(--muted)]">{service.description}</p>

      {service.features.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {service.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check size={14} className="mt-1 shrink-0 text-brand-500" />
              <span className="text-[color:var(--muted)]">{f}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

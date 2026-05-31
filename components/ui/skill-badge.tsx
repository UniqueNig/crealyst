import Image from "next/image";
import { cn } from "@/lib/cn";
import { isMonochromeIcon } from "@/lib/skills-catalog";

type Props = {
  name: string;
  iconUrl?: string | null;
  className?: string;
};

export function SkillBadge({ name, iconUrl, className }: Props) {
  const mono = isMonochromeIcon(iconUrl);
  return (
    <div
      className={cn(
        "glass group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors hover:border-brand-500/40",
        className
      )}
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={16}
          height={16}
          className={cn(
            "size-4 transition-transform group-hover:scale-110",
            // Brands that opted out of cdn.simpleicons.org render monochrome
            // from jsdelivr. Invert on dark mode so the silhouette stays visible.
            mono && "dark:invert"
          )}
          unoptimized
        />
      ) : (
        <span className="inline-block size-1.5 rounded-full bg-brand-500" />
      )}
      <span>{name}</span>
    </div>
  );
}

export function SkillTile({ name, iconUrl }: Props) {
  const mono = isMonochromeIcon(iconUrl);
  return (
    <div className="glass-panel glass-hover group flex flex-col items-center justify-center gap-3 p-6">
      <div className="flex size-12 items-center justify-center">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={name}
            width={48}
            height={48}
            className={cn(
              "size-10 transition-transform group-hover:scale-110",
              mono && "dark:invert"
            )}
            unoptimized
          />
        ) : (
          <span className="text-lg font-semibold text-brand-500">{name[0]}</span>
        )}
      </div>
      <span className="text-center text-sm font-medium">{name}</span>
    </div>
  );
}

import { labelFor } from "@/lib/account-events";

type Event = {
  id: string;
  kind: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
};

function fmtTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortUserAgent(ua: string | null): string | null {
  if (!ua) return null;
  // Pull out a recognizable client name from the UA string.
  if (/Chrome\/\d+/.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\/\d+/.test(ua)) return "Firefox";
  if (/Safari\/\d+/.test(ua)) return "Safari";
  if (/Mobile/.test(ua)) return "Mobile";
  return null;
}

export function ActivityLog({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[color:var(--muted)]">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {events.map((e, i) => {
        const { title, emoji } = labelFor(e.kind);
        const browser = shortUserAgent(e.userAgent);
        return (
          <li
            key={e.id}
            className={
              "flex items-start gap-3 py-3" +
              (i < events.length - 1
                ? " border-b border-[color:var(--border)]"
                : "")
            }
          >
            <span className="font-mono text-base leading-none">{emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                {fmtTime(e.createdAt)}
                {e.ip ? <> · IP {e.ip}</> : null}
                {browser ? <> · {browser}</> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Props = {
  username: string;
};

/**
 * Client beacon that fires one POST to /api/analytics/view per page load.
 * Lives in the tenant layout so it runs on every public portfolio route.
 * Uses sendBeacon when available so it survives even if the user navigates
 * away immediately (closing the tab right after landing).
 *
 * Project attribution happens server-side: the API parses the path to detect
 * `/projects/<slug>` and links the view to the matching project.
 */
export function TrackView({ username }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    // We pass the username from the server so the API can't be tricked into
    // recording views for a user the visitor doesn't actually have on screen.
    const payload = JSON.stringify({ username, path: pathname });

    // navigator.sendBeacon is the right primitive here — non-blocking,
    // survives unload, no response needed. Falls back to fetch when missing
    // (some embedded browsers, very old versions).
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/view", blob);
    } else {
      // keepalive: true keeps the request in-flight even if the page is
      // closing. Errors swallowed — analytics must never break UX.
      fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* ignore */
      });
    }
  }, [username, pathname]);

  return null;
}

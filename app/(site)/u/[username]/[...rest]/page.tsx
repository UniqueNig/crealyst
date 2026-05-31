import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/data/user";

/**
 * Catch-all for unknown sub-paths under `/u/<username>/*` — e.g. /u/emmanuel/ou.
 * Static and dynamic routes ("/about", "/projects/[slug]") win over this
 * because they're more specific, so this only fires for paths that
 * genuinely don't exist.
 *
 * We trigger `notFound()` so Next renders the closest `not-found.tsx` — which
 * is the contextual "page not found" page inside this folder. If the user
 * also doesn't exist, we'd want the higher-level "portfolio not found" page,
 * but in that case the tenant layout has ALREADY thrown notFound() before we
 * get here.
 */
export default async function CatchAll({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  // Verify the user exists so this route also bails for /u/<wrong>/<anything>
  // (the tenant layout would have caught it, but defense in depth).
  await getUserByUsername(username);
  notFound();
}

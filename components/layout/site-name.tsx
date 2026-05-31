import { getSiteName } from "@/lib/site";

/**
 * Renders the deployment's name (the portfolio owner's, in tenant mode) as
 * plain text. Drop it inside whatever <Link>/<header> wraps the wordmark so it
 * inherits the surrounding typography. Async server component — safe to render
 * as a child of any server component.
 */
export async function SiteName() {
  const name = await getSiteName();
  return <>{name}</>;
}

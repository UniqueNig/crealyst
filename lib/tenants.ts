/**
 * Tenant mode: when NEXT_PUBLIC_TENANT_USERNAME is set, this deployment is a
 * single-user portfolio (e.g. emmanuelfaniyi.vercel.app showing Emmanuel only).
 * `proxy.ts` rewrites root paths like `/about` to `/u/<tenant>/about` so the URL
 * bar stays clean.
 *
 * When the env var is unset/empty, this deployment is the SaaS — `/` shows the
 * marketing landing and portfolios live at `/u/<username>/...`.
 */
export function getTenantUsername(): string | null {
  const v = process.env.NEXT_PUBLIC_TENANT_USERNAME?.trim();
  return v && v.length > 0 ? v : null;
}

export function isTenantMode(): boolean {
  return getTenantUsername() !== null;
}

/**
 * Build a public-facing href for a tenant's page. In tenant mode (single-user
 * deployment), URLs are kept root-relative so `proxy.ts` rewrites them
 * invisibly. In SaaS mode, links are prefixed with `/u/<username>`.
 */
export function tenantHref(username: string, path: string): string {
  if (isTenantMode()) {
    return path === "" ? "/" : path;
  }
  const cleanPath = path === "/" || path === "" ? "" : path;
  return `/u/${username}${cleanPath}`;
}

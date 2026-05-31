import { getUserByUsername } from "@/lib/data/user";
import { getProfile } from "@/lib/data/profile";
import { isTenantMode } from "@/lib/tenants";

const TENANT = process.env.NEXT_PUBLIC_TENANT_USERNAME?.trim();

/**
 * The name shown in system/auth chrome (login, password reset, email verify,
 * the welcome wizard, 404s) and in the root metadata title template.
 *
 * This is a single-tenant deployment, so the "brand" is simply the portfolio
 * owner: we resolve his display name from the profile he fills in at /welcome.
 * Until then we fall back to a titleized version of the tenant username, and
 * finally to a neutral "Portfolio" if tenant mode isn't configured at all.
 *
 * We deliberately do NOT hardcode a product name here — the public site is
 * the friend's personal portfolio, not a branded SaaS.
 */
export async function getSiteName(): Promise<string> {
  if (isTenantMode() && TENANT) {
    try {
      const user = await getUserByUsername(TENANT);
      const profile = user ? await getProfile(user.id) : null;
      const name = profile?.name?.trim();
      if (name) return name;
    } catch {
      // fall through to the username-derived fallback
    }
    return TENANT.charAt(0).toUpperCase() + TENANT.slice(1);
  }
  return "Portfolio";
}

/**
 * Single uppercase letter for the root favicon / Apple touch icon. Derived
 * from the owner's name (or username), falling back to a neutral dot.
 */
export async function getSiteInitial(): Promise<string> {
  const name = await getSiteName();
  return name.trim().charAt(0).toUpperCase() || "·";
}

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "ef_session";

// Reserved path prefixes that NEVER get rewritten to a tenant URL, even when
// the deployment is in tenant mode. Keep this in sync with anything that lives
// at the root of the SaaS (auth, API, the tenant routes themselves, internals).
const NEVER_REWRITE_PREFIXES = [
  "/u",
  "/admin",
  "/api",
  "/_next",
  "/signup",
  "/login",
  "/dashboard",
  "/platform",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const STATIC_FILE_RE = /\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|map|txt|xml|woff2?|ttf)$/i;

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

// File-based metadata routes from app/icon.tsx, app/apple-icon.tsx,
// app/opengraph-image.tsx, etc. Next 16 emits them at /<name>-<hash> with
// NO file extension, so STATIC_FILE_RE misses them. Without this check the
// proxy rewrites the favicon URL to /u/<tenant>/icon-<hash> which 404s,
// and the browser falls back to its default Earth icon.
const NEXT_METADATA_RE =
  /^\/(icon|apple-icon|opengraph-image|twitter-image)(-[a-z0-9]+)?(\.\w+)?$/i;

function shouldRewriteToTenant(pathname: string): boolean {
  if (STATIC_FILE_RE.test(pathname)) return false;
  if (NEXT_METADATA_RE.test(pathname)) return false;
  for (const prefix of NEVER_REWRITE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return false;
  }
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await isValidSession(token);
  const tenant = process.env.NEXT_PUBLIC_TENANT_USERNAME?.trim();

  // ─── Admin + platform auth gating ─────────────────────────────────────
  // Login/signup live at /login and /signup (root, not under /admin).
  // /admin = per-user dashboard. /platform = OWNER-only super-admin.
  //
  // In tenant mode we deliberately do NOT gate /platform: platform admin makes
  // no sense for a single-user deployment, so we let the request fall through
  // to app/platform/layout.tsx, which calls notFound() in tenant mode. Gating
  // it here would 307 → /login instead of the intended 404.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/welcome") ||
    (!tenant && pathname.startsWith("/platform"))
  ) {
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ─── Tenant mode: rewrite root paths to /u/<tenant>/... ───────────────
  // When NEXT_PUBLIC_TENANT_USERNAME is set, this deployment is a single-user
  // portfolio. URLs stay root-relative for the visitor, but the actual page
  // rendered is the tenant's. emmanuelfaniyi.vercel.app/about renders the
  // /u/emmanuel/about page while the URL bar shows /about.
  if (tenant && shouldRewriteToTenant(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/u/${tenant}` : `/u/${tenant}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next's own assets so the tenant rewrite can fire
  // on any public path. We still gate admin via the logic above.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

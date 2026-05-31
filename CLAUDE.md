@AGENTS.md

# Crealyst — handoff context

You're starting a fresh chat in this folder. Read this first.

## What this project IS

This is a **single-tenant copy of Folonest's codebase**, set up to host one
person's portfolio. It's NOT a SaaS. It's NOT a fork that will be merged
back. It's a long-lived sister project for a graphic designer friend of the
owner — running on the friend's own free-tier accounts so the owner doesn't
pay for his hosting.

- **Owner**: Emmanuel (also owns Folonest — the parent SaaS this was copied
  from). Emmanuel does the technical work; the friend operates the live
  portfolio via /admin.
- **End user**: A graphic designer friend of Emmanuel's. He gets one portfolio
  at the deployment's root (`/`) and an admin panel at `/admin`. He does NOT
  manage other users.
- **The "Crealyst" name** is the project folder / repo name. The friend will
  pick his own display name + username during setup; the public portfolio
  shows HIS name, not "Crealyst" or "Folonest".

## Where this came from

- **Parent project (Folonest SaaS)**: lives at
  `C:\Users\user\OneDrive\Desktop\Emmanuel Faniyi\emmanuelfaniyi`
  — GitHub: `github.com/UniqueNig/emmanuelfaniyi`
  — Deployed: `folonest.vercel.app` (SaaS) + `emmanuelfaniyi.vercel.app`
  (Emmanuel's own tenant deployment using the SAME repo with
  `NEXT_PUBLIC_TENANT_USERNAME=emmanuel`)
- **This Crealyst folder** was robocopy'd from the parent on initial setup,
  excluding `node_modules`, `.next`, `.git`, `.env`, `.vercel`. Treat it as
  its own independent project from here on — own git history, own repo, own
  deploy.

## How the same code can be three different things

ONE codebase serves THREE deployments:

| Deployment | Mode | `NEXT_PUBLIC_TENANT_USERNAME` |
|---|---|---|
| `folonest.vercel.app` | SaaS (anyone signs up) | unset |
| `emmanuelfaniyi.vercel.app` | Emmanuel's portfolio | `emmanuel` |
| **Crealyst (this folder)** | Friend's portfolio | `<his username>` |

`proxy.ts` reads that env var. When it's set, root paths like `/about` are
rewritten to `/u/<tenant>/about` so URLs stay clean while the same tenant
page components render. `lib/tenants.ts` exposes `isTenantMode()` and
`tenantHref()` for components to branch on this.

## What's ALREADY in place (don't redo)

- **Multi-tenant codebase** with single-tenant mode via env var (see above)
- **Lockdown patch**: `app/signup/page.tsx` and `app/platform/layout.tsx`
  both call `notFound()` when `isTenantMode()` is true. So `/signup` and
  `/platform` 404 on Crealyst. Friend's portfolio can't be polluted by
  random signups, and the platform-admin UI (which doesn't apply to a
  one-user deployment) is hidden.
- **Full Folonest feature set**: profile, projects, skills (147-entry
  catalog with Simple Icons), services, experience, education,
  certifications, contact form (rate-limited), CV generator, analytics
  (anonymous), theme accent picker, audit log, account events.
- **`.env.example`**: a template `.env` file is in the root; copy it to
  `.env` and fill in the friend's values.

## What still needs to happen

### Phase A — Friend creates 4 free accounts
He must do this himself; you can sit next to him. ALL free tiers, no
credit card required.

| Account | What it's for | Where |
|---|---|---|
| MongoDB Atlas | Portfolio database (free M0, 512MB) | `mongodb.com/cloud/atlas` |
| Cloudinary | Image uploads (free 25GB) | `cloudinary.com` |
| Resend | Contact form + auth emails (free 100/day) | `resend.com` |
| Vercel | Hosting (free hobby) | `vercel.com` |

He shares these credentials with you (or sets them himself in Vercel later):
- MongoDB connection string (DATABASE_URL)
- Cloudinary cloud_name + api_key + api_secret + unsigned upload preset
- Resend API key

### Phase B — Local setup

```powershell
cd "C:\Users\user\OneDrive\Desktop\Crealyst"
npm install
```

Create `.env` (copy from `.env.example`) and fill in HIS values. The key
line at the bottom:

```
NEXT_PUBLIC_TENANT_USERNAME=<his-chosen-username>
```

That's the switch that makes this a single-user portfolio.

Push the schema to his MongoDB:

```powershell
npm run db:push
```

### Phase C — Create his User account

`/signup` is locked out by the lockdown patch, so we can't just visit it.
Two options:

**Option 1 (easy): temporarily unlock /signup, sign up, re-lock**

1. In `app/signup/page.tsx`, comment out the `if (isTenantMode()) notFound();`
   line (around line 17)
2. `npm run dev`
3. Visit `localhost:3000/signup` → friend signs up with email + the
   username matching `NEXT_PUBLIC_TENANT_USERNAME`
4. Uncomment the line — `/signup` is locked again

**Option 2 (cleaner): write a one-time seed script**

Create `scripts/create-tenant-user.ts` that reads env vars, hashes the
password, and inserts the User row directly via prisma. Run once with
`npx tsx scripts/create-tenant-user.ts`. No /signup unlock needed.

If the friend wants the OWNER role (for /platform — which is locked here
anyway, but defense in depth), set role manually in MongoDB Atlas or
extend the seed script.

### Phase D — Onboarding

After signing up, the friend should:
1. Visit `localhost:3000/welcome` — fills in name, title, tagline, bio
2. Visit `localhost:3000/admin` — adds projects, skills, services,
   experience, education, certifications, social links, profile photo

### Phase E — Deploy

1. Friend creates a private GitHub repo (e.g. `crealyst-portfolio`)
2. From this folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial Crealyst deployment"
   git remote add origin https://github.com/<friend>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
3. Friend imports the repo on his Vercel account
4. Set the same env vars from `.env` but change:
   - `NEXT_PUBLIC_SITE_URL` to his Vercel URL (e.g. `https://crealyst.vercel.app`)
5. Deploy → his portfolio is live

### Phase F — Verify

- `crealyst.vercel.app/` → his portfolio homepage ✓
- `crealyst.vercel.app/about`, `/projects`, `/contact` → his pages ✓
- `crealyst.vercel.app/admin` → his admin login ✓
- `crealyst.vercel.app/signup` → **404** (lockdown) ✓
- `crealyst.vercel.app/platform` → **404** (lockdown) ✓
- `crealyst.vercel.app/explore` → **404** (single-tenant by design) ✓
- Favicon → his initial (or his avatar if he uploaded one) on his accent color

## Stack & conventions

- **Next.js 16.2.6** (App Router, Turbopack, `proxy.ts` not `middleware.ts`,
  `await params` for Promise-based params) — see `AGENTS.md`
- **MongoDB + Prisma 6** (pinned — Prisma 7 dropped MongoDB)
- **GraphQL via Yoga + Pothos** (admin uses urql client)
- **Custom JWT auth** (`jose` + `bcryptjs`), 7-day sessions
- **Tailwind CSS 4** (CSS variables in `globals.css`, `@theme` directive)
- **Cookie-based theme** (no client init script, no React 19 `<script>` warning)
- **Path-based tenants** at `/u/<username>` (no subdomains, free Vercel tier)
- **Single chokepoint** for active-user check: `lib/data/user.ts` → filters
  suspended/soft-deleted users; everywhere else trusts it

## Key files

| File | Why it matters |
|---|---|
| `proxy.ts` | Tenant rewrite + auth gate; reads `NEXT_PUBLIC_TENANT_USERNAME` |
| `lib/tenants.ts` | `isTenantMode()`, `tenantHref(username, path)` |
| `app/signup/page.tsx`, `app/platform/layout.tsx` | Lockdown patch (404 in tenant mode) |
| `app/(site)/u/[username]/layout.tsx` | Per-user metadata + icon + theme |
| `app/admin/(dashboard)/` | Admin panel — most editing happens here |
| `prisma/schema.prisma` | DB schema; everything scoped by `userId` |
| `lib/skills-catalog.ts` | 147-entry skill catalog for the picker |
| `lib/cv-generator.ts` | Builds the auto-CV PDF |

## Things to NOT do

- **Don't rebrand to "Crealyst" in code** — the friend's public portfolio
  already shows HIS name (per-user metadata, OG, favicon). The "Folonest"
  wordmark only appears on `/login`, `/forgot-password`, `/reset-password`,
  `/verify-email` — auth pages that only he sees. Rebranding those is
  cosmetic polish, not urgent.
- **Don't share `DATABASE_URL` with Folonest** — separate databases, separate
  user pools. Total isolation.
- **Don't push this folder to Folonest's GitHub repo** — they're independent.
  Friend gets his own private repo.
- **Don't merge Folonest changes back automatically** — if Folonest gets new
  features and the friend wants them, manually port the relevant commits.
  Use `git diff` between the two folders.
- **Don't commit `.env`** — it's in `.gitignore`. Each env var goes in the
  Vercel UI instead.

## If something breaks

The same things that break in Folonest can break here. Known recurring
gotchas:

- **Windows EPERM on `query_engine-windows.dll.node`** during `prisma
  generate` — kill node processes: `Get-Process node | Stop-Process -Force`,
  then re-run.
- **`unstable_cache` returns strings, not Dates** after the JSON round-trip.
  Coerce with `new Date(value)` before calling `.getTime()`.
- **`/u/<username>` returns 404 unexpectedly** — Prisma+MongoDB doesn't
  reliably match `null` against missing fields. The `getUserByUsername`
  helper already does the two-step fetch+JS-filter dance to avoid this.
- **React 19 inline `<script>` warning** — already solved via cookie-based
  theme (no client init script). Don't add `<script>` tags through JSX.

Good luck. Read the relevant Next 16 doc in `node_modules/next/dist/docs/`
before adding new APIs.

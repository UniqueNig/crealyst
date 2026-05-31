import Link from "next/link";
import {
  FolderKanban,
  Briefcase,
  Sparkles,
  Building2,
  Inbox,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Circle,
  Eye,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getAnalyticsSnapshot } from "@/lib/data/analytics";

async function loadDashboard(userId: string) {
  const [
    profile,
    projects,
    services,
    skills,
    experience,
    education,
    certifications,
    messages,
    unreadMessages,
    recent,
  ] = await Promise.all([
    prisma.profile.findFirst({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.service.count({ where: { userId } }),
    prisma.skill.count({ where: { userId } }),
    prisma.experience.count({ where: { userId } }),
    prisma.education.count({ where: { userId } }),
    prisma.certification.count({ where: { userId } }),
    prisma.contactMessage.count({ where: { userId } }),
    prisma.contactMessage.count({ where: { userId, read: false } }),
    prisma.contactMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  return {
    profile,
    counts: { projects, services, skills, experience, education, certifications },
    messages,
    unreadMessages,
    recent,
  };
}

const STATS = [
  { key: "projects", label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { key: "services", label: "Services", href: "/admin/services", icon: Briefcase },
  { key: "skills", label: "Skills", href: "/admin/skills", icon: Sparkles },
  { key: "experience", label: "Experience", href: "/admin/experience", icon: Building2 },
] as const;

function profileLooksEmpty(p: { title?: string | null; bio?: string | null } | null) {
  if (!p) return true;
  const title = (p.title ?? "").trim();
  const bio = (p.bio ?? "").trim();
  return !title || !bio || bio.length < 30;
}

export default async function DashboardPage() {
  const session = await verifySession();
  const [s, analytics] = await Promise.all([
    loadDashboard(session.sub),
    getAnalyticsSnapshot(session.sub, 30),
  ]);

  const totalContent =
    s.counts.projects +
    s.counts.services +
    s.counts.skills +
    s.counts.experience +
    s.counts.education +
    s.counts.certifications;

  const isFreshAccount = totalContent === 0 && profileLooksEmpty(s.profile);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title={`Welcome, ${session.username}`}
        description={
          isFreshAccount
            ? "Your portfolio shell is ready. Let's fill it in."
            : "Manage everything your portfolio shows publicly."
        }
        actions={
          <Link
            href={`/u/${session.username}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] hover:border-brand-500/40 hover:text-foreground"
          >
            View live
            <ExternalLink size={12} />
          </Link>
        }
      />

      {isFreshAccount && (
        <OnboardingCard
          profileFilled={!profileLooksEmpty(s.profile)}
          hasProjects={s.counts.projects > 0}
          hasServices={s.counts.services > 0}
        />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const count = s.counts[stat.key];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="group flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/40"
            >
              <div className="flex items-center justify-between">
                <Icon size={18} className="text-brand-500" />
                <ArrowRight
                  size={14}
                  className="text-[color:var(--muted)] transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {count}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {stat.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <AnalyticsCard analytics={analytics} username={session.username} />

      <Link
        href="/admin/messages"
        className="group mt-8 flex items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500/40"
      >
        <div className="flex items-center gap-4">
          <span className="relative flex size-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Inbox size={18} />
            {s.unreadMessages > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {s.unreadMessages}
              </span>
            )}
          </span>
          <div>
            <p className="text-base font-medium">Inbox</p>
            <p className="text-sm text-[color:var(--muted)]">
              {s.messages} total · {s.unreadMessages} unread
            </p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-[color:var(--muted)] transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      {s.recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            Recent messages
          </h2>
          <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
            <ul className="divide-y divide-[color:var(--border)]">
              {s.recent.map((m) => (
                <li key={m.id}>
                  <Link
                    href="/admin/messages"
                    className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-[color:var(--border)]/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {m.name}
                        </p>
                        {!m.read && (
                          <span className="inline-flex size-1.5 shrink-0 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-[color:var(--muted)]">
                        {m.subject ?? m.message.slice(0, 80)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[color:var(--muted)]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function prettyPath(path: string): string {
  // Strip /u/<name> prefix so the dashboard shows portfolio-relative paths.
  const trimmed = path.replace(/^\/u\/[^/]+/, "") || "/";
  return trimmed === "" ? "/" : trimmed;
}

function AnalyticsCard({
  analytics,
  username,
}: {
  analytics: import("@/lib/data/analytics").AnalyticsSnapshot;
  username: string;
}) {
  const empty = analytics.totalViews === 0;
  return (
    <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Last {analytics.windowDays} days
          </p>
          <h2 className="mt-1 text-base font-semibold">Portfolio analytics</h2>
        </div>
        <Link
          href={`/u/${username}`}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs text-[color:var(--muted)] hover:text-foreground"
        >
          View live →
        </Link>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Eye size={16} />
          </span>
          <div>
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {analytics.totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-[color:var(--muted)]">Total views</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Users size={16} />
          </span>
          <div>
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {analytics.uniqueVisitors.toLocaleString()}
            </p>
            <p className="text-xs text-[color:var(--muted)]">Unique visitors</p>
          </div>
        </div>
      </div>

      {empty ? (
        <p className="mt-5 rounded-lg border border-dashed border-[color:var(--border)] p-5 text-center text-xs text-[color:var(--muted)]">
          No views yet. Share your portfolio link to start tracking traffic.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
              Top pages
            </p>
            <ul className="flex flex-col gap-1.5">
              {analytics.topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-mono text-xs">
                    {prettyPath(p.path)}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[color:var(--muted)]">
                    {p.views}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
              Top referrers
            </p>
            {analytics.topReferrers.length === 0 ? (
              <p className="text-xs text-[color:var(--muted)]">
                All views came directly — no external referrers yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {analytics.topReferrers.map((r) => (
                  <li
                    key={r.referrer}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-xs">{r.referrer}</span>
                    <span className="shrink-0 font-mono text-xs text-[color:var(--muted)]">
                      {r.views}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function OnboardingCard({
  profileFilled,
  hasProjects,
  hasServices,
}: {
  profileFilled: boolean;
  hasProjects: boolean;
  hasServices: boolean;
}) {
  const steps = [
    {
      done: profileFilled,
      href: "/admin/profile",
      title: "Fill in your profile",
      body: "Add your title, tagline, bio, and photo. This is what visitors see first.",
    },
    {
      done: hasProjects,
      href: "/admin/projects/new",
      title: "Add your first project",
      body: "A case study with images, role, tech stack, and live links.",
    },
    {
      done: hasServices,
      href: "/admin/services/new",
      title: "List a service you offer",
      body: "Optional — useful if you take on freelance or consulting work.",
    },
  ];
  const remaining = steps.filter((s) => !s.done).length;

  return (
    <section className="mt-8 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-500">
            First steps
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {remaining === 0 ? "You're all set!" : `${remaining} step${remaining === 1 ? "" : "s"} to go`}
          </h2>
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {steps.map((s) => {
          const Icon = s.done ? CheckCircle2 : Circle;
          return (
            <li key={s.title}>
              <Link
                href={s.href}
                className="group flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:border-brand-500/40"
              >
                <Icon
                  size={20}
                  className={s.done ? "mt-0.5 text-brand-500" : "mt-0.5 text-[color:var(--muted)]"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                    {s.body}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="mt-1.5 shrink-0 text-[color:var(--muted)] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

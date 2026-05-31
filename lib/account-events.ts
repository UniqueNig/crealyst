import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";

export type AccountEventKind =
  | "signup"
  | "login_success"
  | "password_changed"
  | "email_changed"
  | "username_changed"
  | "email_verified"
  | "password_reset_requested"
  | "password_reset_completed"
  | "account_suspended"
  | "account_unsuspended"
  | "account_soft_deleted"
  | "account_restored"
  | "owner_promoted"
  | "owner_demoted";

export type AccountEventLabel = {
  title: string;
  emoji: string;
};

const LABELS: Record<AccountEventKind, AccountEventLabel> = {
  signup: { title: "Account created", emoji: "✨" },
  login_success: { title: "Signed in", emoji: "🔑" },
  password_changed: { title: "Password changed", emoji: "🔒" },
  email_changed: { title: "Email address changed", emoji: "✉" },
  username_changed: { title: "Username changed", emoji: "🪪" },
  email_verified: { title: "Email verified", emoji: "✓" },
  password_reset_requested: {
    title: "Password reset link requested",
    emoji: "🔁",
  },
  password_reset_completed: {
    title: "Password reset via email link",
    emoji: "🔓",
  },
  account_suspended: { title: "Account suspended", emoji: "🚫" },
  account_unsuspended: { title: "Suspension lifted", emoji: "✅" },
  account_soft_deleted: { title: "Account deactivated", emoji: "🗑" },
  account_restored: { title: "Account restored", emoji: "♻" },
  owner_promoted: { title: "Promoted to platform OWNER", emoji: "🛡" },
  owner_demoted: { title: "Demoted to regular user", emoji: "👤" },
};

export function labelFor(kind: string): AccountEventLabel {
  return (
    LABELS[kind as AccountEventKind] ?? {
      title: kind.replace(/_/g, " "),
      emoji: "•",
    }
  );
}

/**
 * Record an account event. Captures IP + user-agent from the current request
 * headers automatically. Failures are swallowed (logged) — never block the
 * caller's primary flow over an audit-log write.
 */
export async function logAccountEvent(
  userId: string,
  kind: AccountEventKind,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const [ip, h] = await Promise.all([getClientIp(), headers()]);
    const userAgent = h.get("user-agent")?.slice(0, 500) ?? null;

    await prisma.accountEvent.create({
      data: {
        userId,
        kind,
        ip: ip === "anonymous" ? null : ip,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (e) {
    console.error("[account-events] failed to log", { userId, kind }, e);
  }
}

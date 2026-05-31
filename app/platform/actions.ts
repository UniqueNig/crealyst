"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { logAccountEvent } from "@/lib/account-events";

export type ActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

type ModerationTarget = {
  id: string;
  role: "OWNER" | "USER";
  username: string;
  suspendedAt: Date | null;
  deletedAt: Date | null;
};

// Discriminated union: TypeScript narrows `target` to non-null after
// checking `ok === true` (or returning early on `ok === false`).
type ModerationResolve =
  | { ok: true; target: ModerationTarget }
  | { ok: false; error: { status: "error"; message: string } };

/**
 * Look up a user we're about to moderate and apply the universal guardrails:
 *  - reject if it's the acting OWNER targeting themselves
 *  - reject if not found
 *  - reject if the target is another OWNER (OWNERs must demote first)
 */
async function loadModerationTarget(
  actorId: string,
  userId: string
): Promise<ModerationResolve> {
  if (userId === actorId) {
    return {
      ok: false,
      error: {
        status: "error",
        message:
          "You can't moderate your own account from here. Use Account → Danger zone if you need to leave.",
      },
    };
  }
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      username: true,
      suspendedAt: true,
      deletedAt: true,
    },
  });
  if (!target) {
    return {
      ok: false,
      error: { status: "error", message: "User not found." },
    };
  }
  if (target.role === "OWNER") {
    return {
      ok: false,
      error: {
        status: "error",
        message: "Can't moderate another OWNER. Demote them to USER first.",
      },
    };
  }
  return { ok: true, target };
}

export async function deletePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();
  const result = await loadModerationTarget(me.sub, userId);
  if (!result.ok) return result.error;
  const { target } = result;

  await prisma.user.delete({ where: { id: userId } });
  revalidateTag(`user:${target.username}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  return { status: "success" };
}

export async function suspendPlatformUserAction(
  userId: string,
  reason: string
): Promise<ActionResult> {
  const me = await requireOwner();
  const result = await loadModerationTarget(me.sub, userId);
  if (!result.ok) return result.error;
  const { target } = result;
  if (target.suspendedAt) {
    return { status: "error", message: "User is already suspended." };
  }

  const trimmed = reason.trim().slice(0, 280);
  await prisma.user.update({
    where: { id: userId },
    data: {
      suspendedAt: new Date(),
      suspensionReason: trimmed || null,
    },
  });
  revalidateTag(`user:${target.username}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  await logAccountEvent(userId, "account_suspended", {
    by: me.username,
    reason: trimmed || null,
  });
  return { status: "success" };
}

export async function unsuspendPlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();
  const result = await loadModerationTarget(me.sub, userId);
  if (!result.ok) return result.error;
  const { target } = result;
  if (!target.suspendedAt) {
    return { status: "error", message: "User isn't suspended." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { suspendedAt: null, suspensionReason: null },
  });
  revalidateTag(`user:${target.username}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  await logAccountEvent(userId, "account_unsuspended", { by: me.username });
  return { status: "success" };
}

export async function softDeletePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();
  const result = await loadModerationTarget(me.sub, userId);
  if (!result.ok) return result.error;
  const { target } = result;
  if (target.deletedAt) {
    return { status: "error", message: "User is already deactivated." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
  revalidateTag(`user:${target.username}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  await logAccountEvent(userId, "account_soft_deleted", { by: me.username });
  return { status: "success" };
}

export async function restorePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();
  const result = await loadModerationTarget(me.sub, userId);
  if (!result.ok) return result.error;
  const { target } = result;
  if (!target.deletedAt && !target.suspendedAt) {
    return { status: "error", message: "User is already active." };
  }

  // Restoring clears BOTH flags — the goal is "make this account active again."
  // Distinct un-suspend / un-soft-delete is overkill for an MVP.
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null, suspendedAt: null, suspensionReason: null },
  });
  revalidateTag(`user:${target.username}`, { expire: 0 });
  revalidateTag("discovery", { expire: 0 });
  await logAccountEvent(userId, "account_restored", { by: me.username });
  return { status: "success" };
}

// ─── Role management ─────────────────────────────────────────────────────
// Promote / demote uses a separate target-loader because the moderation one
// rejects OWNERs (since you can't suspend / delete another OWNER). Role
// changes specifically need to be able to target OWNERs (to demote them).

export async function promotePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();
  if (userId === me.sub) {
    return {
      status: "error",
      message: "You're already an OWNER.",
    };
  }
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true },
  });
  if (!target) return { status: "error", message: "User not found." };
  if (target.role === "OWNER") {
    return { status: "error", message: "User is already an OWNER." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "OWNER" },
  });
  await logAccountEvent(userId, "owner_promoted", { by: me.username });
  return { status: "success" };
}

export async function demotePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const me = await requireOwner();

  // Self-demote is intentionally blocked. If an OWNER wants to step down, the
  // expected flow is: promote a successor first, then have them demote you.
  // Prevents accidentally locking yourself out of /platform.
  if (userId === me.sub) {
    return {
      status: "error",
      message:
        "You can't demote yourself. Promote another OWNER first, then have them demote you.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true },
  });
  if (!target) return { status: "error", message: "User not found." };
  if (target.role !== "OWNER") {
    return { status: "error", message: "User isn't an OWNER." };
  }

  // Hard safety: the platform must always have at least one OWNER, otherwise
  // /platform becomes unreachable. The previous self-demote check covers the
  // common case; this guards the edge where two OWNERs simultaneously try to
  // demote each other.
  const ownerCount = await prisma.user.count({ where: { role: "OWNER" } });
  if (ownerCount <= 1) {
    return {
      status: "error",
      message:
        "Can't demote the last OWNER. Promote someone else to OWNER first.",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  });
  await logAccountEvent(userId, "owner_demoted", { by: me.username });
  return { status: "success" };
}

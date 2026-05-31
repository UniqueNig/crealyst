"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  verifySession,
  verifyPassword,
  hashPassword,
  createSession,
  destroySession,
  validateUsername,
  normalizeUsername,
} from "@/lib/auth";
import { logAccountEvent } from "@/lib/account-events";
import { checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";

export type AccountState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function updateEmailAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await verifySession();
  const newEmail = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (!currentPassword) {
    return { status: "error", message: "Confirm your current password." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { status: "error", message: "Account not found." };

  const passwordOk = await verifyPassword(currentPassword, user.passwordHash);
  if (!passwordOk) {
    return { status: "error", message: "Current password is incorrect." };
  }

  if (newEmail === user.email) {
    return { status: "success", message: "Email is already set to that." };
  }

  const taken = await prisma.user.findUnique({ where: { email: newEmail } });
  if (taken) {
    return { status: "error", message: "That email is already in use." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail, emailVerified: false },
  });
  // Refresh the session JWT with the new email so the UI updates instantly.
  await createSession({
    sub: user.id,
    email: newEmail,
    username: user.username,
  });
  await logAccountEvent(user.id, "email_changed", { from: user.email, to: newEmail });

  return { status: "success", message: "Email updated." };
}

export async function updatePasswordAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await verifySession();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return {
      status: "error",
      message: "New password must be at least 8 characters.",
    };
  }
  if (newPassword !== confirmPassword) {
    return {
      status: "error",
      message: "New password and confirmation don't match.",
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { status: "error", message: "Account not found." };

  const passwordOk = await verifyPassword(currentPassword, user.passwordHash);
  if (!passwordOk) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashed },
  });
  await logAccountEvent(user.id, "password_changed");

  return { status: "success", message: "Password changed." };
}

/**
 * Change the URL-safe username. Cascades:
 *  - busts `user:${oldUsername}` cache so the old portfolio URL stops resolving
 *  - reissues the session JWT so the admin sidebar + tenantHref() pick up the
 *    new username immediately
 *  - logs an audit event with from/to
 *
 * NOTE: When the old username is later registered by someone else, anyone with
 * an old bookmark to /u/<oldname> will see the new account's portfolio. We
 * accept that for now (matches Twitter/GitHub behavior). If we ever need
 * impersonation protection, add an `oldUsernames` array on User and check it
 * during signup.
 */
export async function updateUsernameAction(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await verifySession();
  const newUsername = normalizeUsername(String(formData.get("username") ?? ""));
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!currentPassword) {
    return { status: "error", message: "Confirm your current password." };
  }

  const validation = validateUsername(newUsername);
  if (!validation.ok) {
    return { status: "error", message: validation.reason };
  }

  if (newUsername === session.username) {
    return { status: "success", message: "Username is already set to that." };
  }

  // Rate limit per user: only one change per 24 hours. Prevents toggling and
  // cuts down on accidental cache thrash.
  const limit = checkRateLimit(`username-change:${session.sub}`, 1, 24 * 60 * 60);
  if (!limit.ok) {
    return {
      status: "error",
      message: `You can only change your username once per day. Try again in ${formatRetryAfter(limit.retryAfterSeconds)}.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { status: "error", message: "Account not found." };

  const passwordOk = await verifyPassword(currentPassword, user.passwordHash);
  if (!passwordOk) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const taken = await prisma.user.findUnique({
    where: { username: newUsername },
  });
  if (taken) {
    return { status: "error", message: "That username is already taken." };
  }

  const oldUsername = user.username;

  await prisma.user.update({
    where: { id: user.id },
    data: { username: newUsername },
  });

  // Refresh the session JWT so admin layout reads the new username on next nav.
  await createSession({
    sub: user.id,
    email: user.email,
    username: newUsername,
  });

  // Bust the old username cache so /u/<old> stops serving stale data.
  // The new username has no cache yet — it'll populate on first visit.
  revalidateTag(`user:${oldUsername}`, { expire: 0 });
  // The discovery listing keys portfolios by username — needs a fresh build
  // so the chip on /explore points at the new URL.
  revalidateTag("discovery", { expire: 0 });

  await logAccountEvent(user.id, "username_changed", {
    from: oldUsername,
    to: newUsername,
  });

  return {
    status: "success",
    message: `Username changed. Your portfolio is now at /u/${newUsername}.`,
  };
}

export type DeleteState =
  | { status: "idle" }
  | { status: "error"; message: string };

/**
 * Deletes the account and EVERYTHING that belongs to it: profile, projects,
 * skills, services, experience, education, certifications, contact messages.
 * Relies on Prisma's `onDelete: Cascade` declarations in schema.prisma.
 */
export async function deleteAccountAction(
  _prev: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const session = await verifySession();
  const confirmUsername = String(formData.get("confirmUsername") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (confirmUsername !== session.username) {
    return {
      status: "error",
      message: `Type your exact username (${session.username}) to confirm.`,
    };
  }
  if (!currentPassword) {
    return { status: "error", message: "Confirm your password." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { status: "error", message: "Account not found." };

  const passwordOk = await verifyPassword(currentPassword, user.passwordHash);
  if (!passwordOk) {
    return { status: "error", message: "Password is incorrect." };
  }

  await prisma.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/?deleted=1");
}

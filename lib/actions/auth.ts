"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  destroySession,
  hashPassword,
  loginWithCredentials,
  registerWithCredentials,
  isUsernameAvailable,
  verifySession,
} from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { getSiteTheme } from "@/lib/site";
import {
  passwordResetHtml,
  passwordResetText,
} from "@/lib/email/password-reset";
import {
  verifyEmailHtml,
  verifyEmailText,
} from "@/lib/email/verification";
import { checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { logAccountEvent } from "@/lib/account-events";

const TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MINUTES = 60;
const VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const VERIFY_TOKEN_EXPIRY_HOURS = 24;

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
  }

  // Rate limit: 5 attempts per 15 minutes per IP. Stops credential stuffing.
  const ip = await getClientIp();
  const limit = checkRateLimit(`login:${ip}`, 5, 15 * 60);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many login attempts. Try again in ${formatRetryAfter(limit.retryAfterSeconds)}.`,
    };
  }

  let session: Awaited<ReturnType<typeof loginWithCredentials>>;
  try {
    session = await loginWithCredentials(email, password);
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    let msg = "Login failed. Please try again.";
    if (code === "INVALID_CREDENTIALS") msg = "Invalid email or password.";
    if (code === "ACCOUNT_SUSPENDED") {
      msg = "This account has been suspended. Contact support to appeal.";
    }
    if (code === "ACCOUNT_DEACTIVATED") {
      msg = "This account has been deactivated. Contact support to restore it.";
    }
    return { status: "error", message: msg };
  }

  await logAccountEvent(session.sub, "login_success");
  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

// ─── Signup ───────────────────────────────────────────────────────────────

export type SignupState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<"email" | "password" | "username", string>>;
    };

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  // Rate limit: 3 signups per hour per IP. Hard cap on spam-account creation.
  const ip = await getClientIp();
  const limit = checkRateLimit(`signup:${ip}`, 3, 60 * 60);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many signup attempts. Try again in ${formatRetryAfter(limit.retryAfterSeconds)}.`,
    };
  }

  const errs: Record<string, string> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = "Enter a valid email address.";
  }
  if (password.length < 8) {
    errs.password = "Password must be at least 8 characters.";
  }
  if (!username) {
    errs.username = "Pick a username.";
  } else if (!(await isUsernameAvailable(username))) {
    errs.username = "That username is taken or invalid.";
  }

  if (Object.keys(errs).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: errs as never,
    };
  }

  let newSession: Awaited<ReturnType<typeof registerWithCredentials>>;
  try {
    newSession = await registerWithCredentials({ email, password, username });
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    let userMessage = "Sign up failed. Please try again.";
    if (code === "EMAIL_TAKEN") userMessage = "That email is already in use.";
    if (code === "USERNAME_TAKEN") userMessage = "That username is taken.";
    if (code === "INVALID_EMAIL") userMessage = "Enter a valid email.";
    if (code === "WEAK_PASSWORD") userMessage = "Password must be at least 8 characters.";
    if (code === "INVALID_USERNAME")
      userMessage = "Username may only contain lowercase letters, numbers, and hyphens.";
    return { status: "error", message: userMessage };
  }

  await logAccountEvent(newSession.sub, "signup");
  await issueVerificationToken(email).catch((e) =>
    console.error("[signup] verification email failed", e)
  );

  // First-run onboarding: send new accounts to the basics wizard rather than
  // an empty dashboard. The wizard auto-skips for anyone with a populated
  // profile (e.g. coming back via /signup by accident).
  redirect("/welcome");
}

// ─── Password reset ───────────────────────────────────────────────────────

export type ForgotPasswordState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // Rate limit per email (not IP) so a user can't be locked out by someone
  // else's spam, but each email address can only request a few resets per hour.
  // Caps Resend cost too.
  const limit = checkRateLimit(`reset:${email}`, 3, 60 * 60);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many reset requests. Try again in ${formatRetryAfter(limit.retryAfterSeconds)}.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await logAccountEvent(user.id, "password_reset_requested");
    const token = randomBytes(TOKEN_BYTES).toString("base64url");
    const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password/${token}`;
    const payload = {
      username: user.username,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
      siteUrl,
      accent: (await getSiteTheme())?.scale[500],
    };

    const result = await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: passwordResetText(payload),
      html: passwordResetHtml(payload),
    });

    if (!result.ok && result.reason === "no-api-key") {
      console.warn("[reset] dev fallback — open this URL manually:", resetUrl);
    }
  }

  return {
    status: "success",
    message:
      "If an account with that email exists, we've sent a reset link. Check your inbox.",
  };
}

export type ResetPasswordState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { status: "error", message: "Reset link is invalid." };
  if (newPassword.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters.",
    };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "Passwords don't match." };
  }

  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (
    !user ||
    !user.resetTokenExpiry ||
    user.resetTokenExpiry.getTime() < Date.now()
  ) {
    return {
      status: "error",
      message: "This reset link has expired or already been used.",
    };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  await logAccountEvent(user.id, "password_reset_completed");

  return {
    status: "success",
    message: "Password updated. You can now sign in with your new password.",
  };
}

// ─── Email verification ───────────────────────────────────────────────────

async function issueVerificationToken(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return;

  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiry = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_MS);
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationTokenExpiry: expiry },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const verifyUrl = `${siteUrl}/verify-email/${token}`;
  const payload = {
    username: user.username,
    verifyUrl,
    expiresInHours: VERIFY_TOKEN_EXPIRY_HOURS,
    siteUrl,
    accent: (await getSiteTheme())?.scale[500],
  };

  const result = await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: verifyEmailText(payload),
    html: verifyEmailHtml(payload),
  });

  if (!result.ok && result.reason === "no-api-key") {
    console.warn(
      "[verify] dev fallback — open this URL manually:",
      verifyUrl
    );
  }
}

export type ResendVerificationResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function resendVerificationAction(): Promise<ResendVerificationResult> {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { email: true, emailVerified: true },
  });
  if (!user) {
    return { status: "error", message: "Account not found." };
  }
  if (user.emailVerified) {
    return { status: "success", message: "Your email is already verified." };
  }

  await issueVerificationToken(user.email);
  return {
    status: "success",
    message: `Verification email sent to ${user.email}. Check your inbox (and spam).`,
  };
}

export type VerifyEmailState =
  | { status: "pending" }
  | { status: "success"; email: string }
  | { status: "error"; message: string };

export async function consumeVerificationToken(
  token: string
): Promise<VerifyEmailState> {
  if (!token) return { status: "error", message: "Verification link is invalid." };

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      verificationTokenExpiry: true,
    },
  });

  if (!user) {
    return {
      status: "error",
      message: "This verification link is invalid or already used.",
    };
  }
  if (user.emailVerified) {
    return { status: "success", email: user.email };
  }
  if (
    !user.verificationTokenExpiry ||
    user.verificationTokenExpiry.getTime() < Date.now()
  ) {
    return {
      status: "error",
      message: "This verification link has expired. Request a new one.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  await logAccountEvent(user.id, "email_verified");
  return { status: "success", email: user.email };
}

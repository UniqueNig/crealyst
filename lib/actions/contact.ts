"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import {
  contactNotificationHtml,
  contactNotificationText,
} from "@/lib/email/contact-notification";
import { checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email").max(200),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+\d{6,18}$/, "Enter a valid phone number with country code"),
  subject: z.string().max(160).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export type ContactState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const targetUsername = String(formData.get("targetUsername") ?? "").trim();
  if (!targetUsername) {
    return {
      status: "error",
      message: "Contact form is not configured (missing target user).",
    };
  }

  // Two-tier rate limit:
  //   1. 5 messages/hour per IP per target — caps spamming one portfolio
  //   2. 20 messages/hour per IP across ALL targets — caps blasting many
  // Together they stop both single-target floods and platform-wide sprays.
  const ip = await getClientIp();
  const perTarget = checkRateLimit(
    `contact:${ip}:${targetUsername}`,
    5,
    60 * 60
  );
  if (!perTarget.ok) {
    return {
      status: "error",
      message: `Too many messages. Try again in ${formatRetryAfter(perTarget.retryAfterSeconds)}.`,
    };
  }
  const perIp = checkRateLimit(`contact:${ip}`, 20, 60 * 60);
  if (!perIp.ok) {
    return {
      status: "error",
      message: `Too many messages sent recently. Try again in ${formatRetryAfter(perIp.retryAfterSeconds)}.`,
    };
  }

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  // Look up the portfolio owner with everything we need: verification status,
  // account email (fallback), and public Profile.email (preferred).
  const owner = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      profile: { select: { email: true } },
    },
  });
  if (!owner) {
    console.error("[contact] owner not found for username", targetUsername);
    return {
      status: "error",
      message: "This portfolio no longer exists. Please double-check the link.",
    };
  }

  // Defence-in-depth: the contact page UI already hides the form for
  // unverified owners, but reject submissions at the server boundary too.
  if (!owner.emailVerified) {
    return {
      status: "error",
      message:
        "This portfolio isn't accepting messages yet — the owner hasn't verified their email.",
    };
  }

  try {
    await prisma.contactMessage.create({
      data: { ...parsed.data, userId: owner.id },
    });
  } catch (e) {
    console.error("[contact] db save failed", e);
    return {
      status: "error",
      message: "Something went wrong saving your message. Please try again.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    siteUrl,
  };

  // Prefer Profile.email (the public contact address shown on the portfolio),
  // fall back to User.email (account login) if Profile isn't filled in.
  const recipient =
    (owner.profile?.email && owner.profile.email.trim()) || owner.email;

  await sendEmail({
    to: recipient,
    replyTo: parsed.data.email,
    subject: `[Portfolio] ${parsed.data.subject ?? "New message"} — ${parsed.data.name}`,
    text: contactNotificationText(payload),
    html: contactNotificationHtml(payload),
  });

  return {
    status: "success",
    message: "Thanks — your message is in. I'll reply within a day or two.",
  };
}

import "server-only";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; redirected: boolean }
  | { ok: false; reason: "no-api-key" | "send-failed"; error?: string };

/**
 * Single source of truth for outbound email.
 *
 * If `DEV_EMAIL_OVERRIDE` is set in env, every message gets redirected to that
 * address regardless of the real recipient. The subject line is prefixed with
 * the intended `[to: ...]` so you can verify the routing while testing on
 * Resend's sandbox domain (which only delivers to your verified Resend Gmail).
 *
 * If `RESEND_API_KEY` is missing, the send is skipped entirely and the email
 * payload is logged to the server console — useful for fully offline dev.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.CONTACT_EMAIL_FROM ?? "Portfolio <onboarding@resend.dev>";

  const override = process.env.DEV_EMAIL_OVERRIDE?.trim();
  const actualTo = override || input.to;
  const subject = override
    ? `[to: ${input.to}] ${input.subject}`
    : input.subject;

  if (!apiKey) {
    console.warn(
      `[email] skipped — RESEND_API_KEY not set. Would have sent:\n  to: ${actualTo}\n  subject: ${subject}`
    );
    return { ok: false, reason: "no-api-key" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: actualTo,
      subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) {
      console.error("[email] resend rejected", error);
      return { ok: false, reason: "send-failed", error: String(error.message ?? error) };
    }
    return { ok: true, redirected: Boolean(override) };
  } catch (e) {
    console.error("[email] threw", e);
    return {
      ok: false,
      reason: "send-failed",
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}

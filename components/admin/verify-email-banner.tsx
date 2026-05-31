"use client";

import { useState, useTransition } from "react";
import { MailCheck, X, Loader2 } from "lucide-react";
import { resendVerificationAction } from "@/lib/actions/auth";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  if (dismissed) return null;

  const onResend = () => {
    start(async () => {
      const r = await resendVerificationAction();
      setStatus({ kind: r.status, message: r.message });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-brand-500/30 bg-brand-500/5 px-4 py-3 text-sm sm:px-6">
      <MailCheck size={16} className="shrink-0 text-brand-500" />
      <p className="flex-1 min-w-0">
        <span className="font-medium">Verify your email.</span>{" "}
        <span className="text-[color:var(--muted)]">
          We sent a link to <span className="font-mono">{email}</span>. Check
          your inbox — or resend it below.
        </span>
      </p>
      {status.kind !== "idle" && (
        <span
          className={
            status.kind === "success"
              ? "text-xs text-brand-500"
              : "text-xs text-red-500"
          }
        >
          {status.message}
        </span>
      )}
      <button
        type="button"
        onClick={onResend}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : null}
        Resend
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="inline-flex size-7 items-center justify-center rounded-full text-[color:var(--muted)] hover:bg-brand-500/10 hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

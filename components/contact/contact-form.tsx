"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/cn";
import { submitContact, type ContactState } from "@/lib/actions/contact";

const initialState: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Sending…
        </>
      ) : (
        <>
          Send message
          <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-red-500">{messages[0]}</p>;
}

type Props = { compact?: boolean; targetUsername: string };

export function ContactForm({ compact = false, targetUsername }: Props) {
  const [state, formAction] = useActionState(submitContact, initialState);
  const [phone, setPhone] = useState("");
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-500/20">
          <Send size={20} className="text-brand-500" />
        </div>
        <p className="text-base font-medium">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="targetUsername" value={targetUsername} />
      <div className={cn("grid gap-4", !compact && "md:grid-cols-2")}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
          />
          <FieldError messages={fe?.name} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
          />
          <FieldError messages={fe?.email} />
        </div>
      </div>

      <div className={cn("grid gap-4", !compact && "md:grid-cols-2")}>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
            Phone
          </label>
          <PhoneInput
            defaultCountry="ng"
            value={phone}
            onChange={(p) => setPhone(p)}
            inputProps={{
              id: "phone",
              autoComplete: "tel",
            }}
          />
          <input type="hidden" name="phone" value={phone} />
          <FieldError messages={fe?.phone} />
        </div>
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
            Subject <span className="text-[color:var(--muted)]/60">(optional)</span>
          </label>
          <input
            id="subject"
            name="subject"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
          />
          <FieldError messages={fe?.subject} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={compact ? 4 : 6}
          className="w-full resize-y rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
        />
        <FieldError messages={fe?.message} />
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

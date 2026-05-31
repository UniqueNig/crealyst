"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { signupAction, type SignupState } from "@/lib/actions/auth";

const initialState: SignupState = { status: "idle" };

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Creating your portfolio…
        </>
      ) : (
        "Create my portfolio"
      )}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>({
    status: "idle",
  });

  // Normalize keystrokes the same way the server does
  const normalized = username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);

  // Debounced availability check
  useEffect(() => {
    if (!normalized) {
      setAvailability({ status: "idle" });
      return;
    }
    if (normalized.length < 3) {
      setAvailability({
        status: "taken",
        reason: "At least 3 characters.",
      });
      return;
    }
    setAvailability({ status: "checking" });
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(normalized)}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as
          | { available: true }
          | { available: false; reason: string };
        if (data.available) setAvailability({ status: "available" });
        else setAvailability({ status: "taken", reason: data.reason });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setAvailability({ status: "idle" });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalized]);

  const fe = state.status === "error" ? state.fieldErrors ?? {} : {};
  const submitDisabled =
    availability.status === "checking" || availability.status === "taken";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
        />
        <FieldError message={fe.email} />
      </div>

      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]"
        >
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={30}
            autoComplete="off"
            placeholder="e.g. jane-doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 pr-9 text-sm transition-colors focus:border-brand-500 focus:outline-none"
          />
          {availability.status === "checking" && (
            <Loader2
              size={14}
              className="absolute right-3 top-3 animate-spin text-[color:var(--muted)]"
            />
          )}
          {availability.status === "available" && (
            <Check size={14} className="absolute right-3 top-3 text-brand-500" />
          )}
        </div>
        {availability.status === "available" && (
          <p className="mt-1 text-[11px] text-brand-500">
            Available — your portfolio will live at{" "}
            <span className="font-mono">/u/{normalized}</span>
          </p>
        )}
        {availability.status === "idle" && (
          <p className="mt-1 text-[11px] text-[color:var(--muted)]">
            Your portfolio will live at{" "}
            <span className="font-mono">/u/{normalized || "your-name"}</span>
          </p>
        )}
        {availability.status === "taken" && (
          <p className="mt-1 text-[11px] text-red-500">{availability.reason}</p>
        )}
        <FieldError message={fe.username} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-[color:var(--muted)]">
          At least 8 characters.
        </p>
        <FieldError message={fe.password} />
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
          {state.message}
        </p>
      )}

      <SubmitButton disabled={submitDisabled} />
    </form>
  );
}

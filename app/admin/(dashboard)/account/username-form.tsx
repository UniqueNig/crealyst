"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { updateUsernameAction, type AccountState } from "@/lib/actions/account";
import { Field, Input, Label } from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";

const initial: AccountState = { status: "idle" };

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={disabled}>
      {pending ? "Saving…" : "Change username"}
    </Button>
  );
}

export function UsernameForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction] = useActionState(updateUsernameAction, initial);
  const [username, setUsername] = useState(currentUsername);
  const [availability, setAvailability] = useState<Availability>({
    status: "idle",
  });
  const router = useRouter();

  const normalized = username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);

  // After a successful change, refresh the route so the sidebar (which reads
  // session.username via the server layout) picks up the new value.
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  useEffect(() => {
    // Same value as current — nothing to check.
    if (!normalized || normalized === currentUsername) {
      setAvailability({ status: "idle" });
      return;
    }
    if (normalized.length < 3) {
      setAvailability({ status: "taken", reason: "At least 3 characters." });
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
  }, [normalized, currentUsername]);

  const unchanged = normalized === currentUsername;
  const submitDisabled =
    unchanged ||
    availability.status === "checking" ||
    availability.status === "taken";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field>
        <Label htmlFor="username">New username</Label>
        <div className="relative">
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={30}
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 pr-9 text-sm transition-colors focus:border-brand-500 focus:outline-none"
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
            Available — your portfolio will move to{" "}
            <span className="font-mono">/u/{normalized}</span>
          </p>
        )}
        {availability.status === "idle" && (
          <p className="mt-1 text-[11px] text-[color:var(--muted)]">
            Your portfolio is at{" "}
            <span className="font-mono">/u/{normalized || "your-name"}</span>.
            Anyone visiting your old URL will get a 404 once you change.
          </p>
        )}
        {availability.status === "taken" && (
          <p className="mt-1 text-[11px] text-red-500">{availability.reason}</p>
        )}
      </Field>

      <Field>
        <Label htmlFor="username-currentPassword">Current password</Label>
        <Input
          id="username-currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>

      {state.status === "error" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-sm text-brand-500">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton disabled={submitDisabled} />
      </div>
    </form>
  );
}

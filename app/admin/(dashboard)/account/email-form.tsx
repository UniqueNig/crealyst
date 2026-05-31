"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateEmailAction, type AccountState } from "@/lib/actions/account";
import { Field, Input, Label } from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";

const initial: AccountState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Update email"}
    </Button>
  );
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction] = useActionState(updateEmailAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field>
        <Label htmlFor="email">New email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={currentEmail}
        />
      </Field>
      <Field>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
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
        <SubmitButton />
      </div>
    </form>
  );
}

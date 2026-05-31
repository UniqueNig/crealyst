"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updatePasswordAction, type AccountState } from "@/lib/actions/account";
import { Field, Input, Label } from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";

const initial: AccountState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Change password"}
    </Button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the inputs after a successful save so the form looks reset.
  if (state.status === "success" && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form action={formAction} ref={formRef} className="flex flex-col gap-4">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        <Field>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
      </div>

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

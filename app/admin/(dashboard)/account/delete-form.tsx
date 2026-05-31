"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { deleteAccountAction, type DeleteState } from "@/lib/actions/account";
import { Field, Input, Label } from "@/components/admin/ui/field";

const initial: DeleteState = { status: "idle" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Deleting…
        </>
      ) : (
        <>
          <AlertTriangle size={14} />
          Delete my account
        </>
      )}
    </button>
  );
}

export function DeleteAccountForm({ username }: { username: string }) {
  const [state, formAction] = useActionState(deleteAccountAction, initial);
  const [confirmText, setConfirmText] = useState("");
  const enabled = confirmText.trim() === username;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field>
        <Label htmlFor="confirmUsername" hint={`Type "${username}" to confirm`}>
          Username
        </Label>
        <Input
          id="confirmUsername"
          name="confirmUsername"
          required
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
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

      <div className="flex justify-end">
        <SubmitButton disabled={!enabled} />
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Field, Label, Textarea } from "@/components/admin/ui/field";

type Target = { id: string; username: string } | null;

export function SuspendDialog({
  target,
  pending,
  onCancel,
  onConfirm,
}: {
  target: Target;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (target) setReason("");
  }, [target]);

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold">Suspend @{target.username}?</h3>
        <p className="mt-1.5 text-sm text-[color:var(--muted)]">
          Their portfolio goes dark and they can&apos;t sign in until you lift
          the suspension. Reason is stored in the audit log and shown to staff
          who later review the case.
        </p>

        <div className="mt-5">
          <Field>
            <Label htmlFor="suspend-reason" hint="optional, up to 280 chars">
              Reason
            </Label>
            <Textarea
              id="suspend-reason"
              rows={3}
              maxLength={280}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Reported for spam content"
            />
            <p className="mt-1 text-right text-[11px] text-[color:var(--muted)]">
              {reason.length} / 280
            </p>
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={pending}
            onClick={() => onConfirm(reason)}
          >
            {pending ? "Suspending…" : "Suspend account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

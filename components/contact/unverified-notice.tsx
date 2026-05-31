import { ShieldAlert } from "lucide-react";

export function UnverifiedOwnerNotice() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-[color:var(--background)] text-[color:var(--muted)]">
        <ShieldAlert size={18} />
      </span>
      <div>
        <h3 className="text-base font-semibold">
          This portfolio isn&apos;t accepting messages yet
        </h3>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          The owner hasn&apos;t verified their email address. Once they do,
          this form will reopen automatically.
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Trash2,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Archive,
  RotateCcw,
  ShieldPlus,
  ShieldMinus,
} from "lucide-react";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";
import {
  deletePlatformUserAction,
  suspendPlatformUserAction,
  unsuspendPlatformUserAction,
  softDeletePlatformUserAction,
  restorePlatformUserAction,
  promotePlatformUserAction,
  demotePlatformUserAction,
  type ActionResult,
} from "./actions";
import { SuspendDialog } from "./suspend-dialog";

type Row = {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  role: "OWNER" | "USER";
  suspendedAt: Date | null;
  suspensionReason: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  _count: {
    projects: number;
    services: number;
    skills: number;
    messages: number;
  };
};

type ConfirmKind =
  | "delete"
  | "softDelete"
  | "restore"
  | "unsuspend"
  | "promote"
  | "demote";

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusOf(u: Row): "active" | "suspended" | "deleted" {
  if (u.deletedAt) return "deleted";
  if (u.suspendedAt) return "suspended";
  return "active";
}

function StatusBadge({ user }: { user: Row }) {
  const status = statusOf(user);
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500">
        Active
      </span>
    );
  }
  if (status === "suspended") {
    return (
      <span
        title={user.suspensionReason ?? undefined}
        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500"
      >
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-500">
      Deactivated
    </span>
  );
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [confirmTarget, setConfirmTarget] = useState<{
    user: Row;
    kind: ConfirmKind;
  } | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Row | null>(null);
  const [pending, start] = useTransition();

  const handleResult = (result: ActionResult, successMsg: string) => {
    if (result.status === "error") show("error", result.message);
    else {
      show("success", successMsg);
      router.refresh();
    }
  };

  const onConfirm = () => {
    if (!confirmTarget) return;
    const { user, kind } = confirmTarget;
    start(async () => {
      let result: ActionResult;
      let successMsg = "";
      if (kind === "delete") {
        result = await deletePlatformUserAction(user.id);
        successMsg = `${user.username} deleted.`;
      } else if (kind === "softDelete") {
        result = await softDeletePlatformUserAction(user.id);
        successMsg = `${user.username} deactivated.`;
      } else if (kind === "restore") {
        result = await restorePlatformUserAction(user.id);
        successMsg = `${user.username} restored.`;
      } else if (kind === "unsuspend") {
        result = await unsuspendPlatformUserAction(user.id);
        successMsg = `${user.username} unsuspended.`;
      } else if (kind === "promote") {
        result = await promotePlatformUserAction(user.id);
        successMsg = `${user.username} is now an OWNER.`;
      } else {
        result = await demotePlatformUserAction(user.id);
        successMsg = `${user.username} demoted to USER.`;
      }
      setConfirmTarget(null);
      handleResult(result, successMsg);
    });
  };

  const onSuspend = (reason: string) => {
    if (!suspendTarget) return;
    const target = suspendTarget;
    start(async () => {
      const result = await suspendPlatformUserAction(target.id, reason);
      setSuspendTarget(null);
      handleResult(result, `${target.username} suspended.`);
    });
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
        No users yet.
      </div>
    );
  }

  const confirmCopy: Record<
    ConfirmKind,
    { title: (u: Row) => string; description: string; label: string }
  > = {
    delete: {
      title: (u) => `Hard-delete @${u.username}?`,
      description:
        "Permanently removes the user AND every project, skill, service, experience, education, certification, and contact message they own. Cannot be undone. Soft-delete (Deactivate) is reversible — prefer that unless you're sure.",
      label: "Delete forever",
    },
    softDelete: {
      title: (u) => `Deactivate @${u.username}?`,
      description:
        "Hides their portfolio from the public site and prevents them from signing in. The data stays intact — you can restore them later from this panel.",
      label: "Deactivate",
    },
    restore: {
      title: (u) => `Restore @${u.username}?`,
      description:
        "Brings the account back. Their portfolio becomes public again and they can sign in.",
      label: "Restore",
    },
    unsuspend: {
      title: (u) => `Unsuspend @${u.username}?`,
      description:
        "Lifts the suspension and clears the reason. Their portfolio goes live again immediately.",
      label: "Unsuspend",
    },
    promote: {
      title: (u) => `Make @${u.username} an OWNER?`,
      description:
        "OWNERs have full access to /platform — they can suspend, deactivate, delete other users, and promote / demote OWNERs (including you). Only promote people you'd trust with the whole platform.",
      label: "Promote to OWNER",
    },
    demote: {
      title: (u) => `Demote @${u.username} to a regular user?`,
      description:
        "They'll lose access to /platform immediately. Their portfolio, projects, and account are untouched.",
      label: "Demote",
    },
  };

  return (
    <>
      {/* `overflow-x-auto` is a safety net for narrow screens where even the
          three always-visible columns get close to overflowing because of
          action-button width. User / Status / Actions stay; the rest hide
          progressively as room permits. */}
      <div className="overflow-x-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--border)] bg-[color:var(--background)]">
            <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--muted)]">
              <th className="px-3 py-3 font-semibold sm:px-5">User</th>
              <th className="px-3 py-3 font-semibold sm:px-5">Status</th>
              <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                Joined
              </th>
              <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">
                Projects
              </th>
              <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">
                Services
              </th>
              <th className="hidden px-5 py-3 text-right font-semibold md:table-cell">
                Messages
              </th>
              <th className="w-32 px-3 py-3 text-right font-semibold sm:w-44 sm:px-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {users.map((u) => {
              const status = statusOf(u);
              const isOwner = u.role === "OWNER";
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-[color:var(--border)]/20">
                  <td className="px-3 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">@{u.username}</span>
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                          <ShieldCheck size={10} />
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[color:var(--muted)]">
                      {u.email}
                    </p>
                  </td>
                  <td className="px-3 py-4 sm:px-5">
                    <StatusBadge user={u} />
                    {status === "suspended" && u.suspensionReason && (
                      <p className="mt-1 max-w-[200px] truncate text-[11px] text-[color:var(--muted)]">
                        {u.suspensionReason}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 font-mono text-xs text-[color:var(--muted)] sm:table-cell">
                    {fmt(u.createdAt)}
                  </td>
                  <td className="hidden px-5 py-4 text-right font-mono md:table-cell">
                    {u._count.projects}
                  </td>
                  <td className="hidden px-5 py-4 text-right font-mono md:table-cell">
                    {u._count.services}
                  </td>
                  <td className="hidden px-5 py-4 text-right font-mono md:table-cell">
                    {u._count.messages}
                  </td>
                  <td className="px-3 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link
                        href={`/u/${u.username}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                        aria-label={`View ${u.username}'s portfolio`}
                      >
                        <ExternalLink size={14} />
                      </Link>
                      {!isOwner && status === "active" && (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setSuspendTarget(u)}
                            className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-amber-500/10 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Suspend ${u.username}`}
                            title="Suspend"
                          >
                            <Ban size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              setConfirmTarget({ user: u, kind: "softDelete" })
                            }
                            className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Deactivate ${u.username}`}
                            title="Deactivate (soft delete)"
                          >
                            <Archive size={14} />
                          </button>
                        </>
                      )}
                      {!isOwner && status === "suspended" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setConfirmTarget({ user: u, kind: "unsuspend" })
                          }
                          className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-brand-500/10 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Unsuspend ${u.username}`}
                          title="Unsuspend"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {!isOwner && status === "deleted" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setConfirmTarget({ user: u, kind: "restore" })
                          }
                          className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-brand-500/10 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Restore ${u.username}`}
                          title="Restore"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      {!isOwner && status === "active" && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setConfirmTarget({ user: u, kind: "promote" })
                          }
                          className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-brand-500/10 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Promote ${u.username} to OWNER`}
                          title="Promote to OWNER"
                        >
                          <ShieldPlus size={14} />
                        </button>
                      )}
                      {isOwner && !isSelf && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setConfirmTarget({ user: u, kind: "demote" })
                          }
                          className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-amber-500/10 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Demote ${u.username} to USER`}
                          title="Demote to USER"
                        >
                          <ShieldMinus size={14} />
                        </button>
                      )}
                      {!isOwner && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setConfirmTarget({ user: u, kind: "delete" })
                          }
                          className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Hard-delete ${u.username}`}
                          title="Hard delete (permanent)"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Confirm
        open={confirmTarget !== null}
        title={
          confirmTarget
            ? confirmCopy[confirmTarget.kind].title(confirmTarget.user)
            : ""
        }
        description={
          confirmTarget ? confirmCopy[confirmTarget.kind].description : ""
        }
        confirmLabel={
          pending
            ? "Working…"
            : confirmTarget
              ? confirmCopy[confirmTarget.kind].label
              : ""
        }
        onConfirm={onConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      <SuspendDialog
        target={suspendTarget}
        pending={pending}
        onCancel={() => setSuspendTarget(null)}
        onConfirm={onSuspend}
      />
    </>
  );
}

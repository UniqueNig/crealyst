"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { Trash2, MailOpen, Mail, ChevronDown, Phone, MessageCircle } from "lucide-react";
import type { ContactMessage } from "@prisma/client";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";
import { cn } from "@/lib/cn";
import { whatsappLink, telLink } from "@/lib/phone";

const MARK_READ = `mutation MarkRead($id: String!, $read: Boolean!) { markMessageRead(id: $id, read: $read) { id read } }`;
const DELETE_MSG = `mutation DeleteMessage($id: String!) { deleteMessage(id: $id) }`;

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, markRead] = useMutation(MARK_READ);
  const [, del] = useMutation(DELETE_MSG);

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
        No messages yet. They&apos;ll appear here as people use the contact form.
      </div>
    );
  }

  const onToggleRead = async (id: string, currentRead: boolean) => {
    const r = await markRead({ id, read: !currentRead });
    if (r.error) show("error", r.error.message);
    else router.refresh();
  };

  const onDelete = async () => {
    if (!confirmId) return;
    const r = await del({ id: confirmId });
    setConfirmId(null);
    if (r.error) show("error", r.error.message);
    else {
      show("success", "Deleted.");
      router.refresh();
    }
  };

  return (
    <>
      <ul className="flex flex-col gap-2">
        {messages.map((m) => {
          const open = expanded === m.id;
          return (
            <li
              key={m.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-[color:var(--surface)] transition-colors",
                m.read
                  ? "border-[color:var(--border)]"
                  : "border-brand-500/40"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setExpanded(open ? null : m.id);
                  if (!m.read) onToggleRead(m.id, false);
                }}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                {!m.read && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {m.name}{" "}
                      <span className="font-normal text-[color:var(--muted)]">
                        &lt;{m.email}&gt;
                      </span>
                    </p>
                    <span className="font-mono text-[11px] text-[color:var(--muted)]">
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm">
                    {m.subject ?? <em>(no subject)</em>}
                  </p>
                  {!open && (
                    <p className="mt-1 line-clamp-1 text-xs text-[color:var(--muted)]">
                      {m.message}
                    </p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={cn(
                    "mt-1 shrink-0 text-[color:var(--muted)] transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>

              {open && (
                <div className="border-t border-[color:var(--border)] px-5 py-4">
                  {m.phone && (
                    <p className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[color:var(--background)] px-3 py-1.5 text-xs text-[color:var(--muted)]">
                      <Phone size={12} />
                      <span className="font-mono text-foreground">{m.phone}</span>
                    </p>
                  )}
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {m.message}
                  </pre>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "your message")}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs hover:border-brand-500/40"
                    >
                      <Mail size={12} />
                      Email
                    </a>
                    {m.phone && whatsappLink(m.phone) && (
                      <a
                        href={whatsappLink(m.phone)!}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-lg border border-[#25d36644] px-3 py-1.5 text-xs text-[#25d366] hover:bg-[#25d366]/10"
                      >
                        <MessageCircle size={12} />
                        WhatsApp
                      </a>
                    )}
                    {m.phone && telLink(m.phone) && (
                      <a
                        href={telLink(m.phone)!}
                        className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs hover:border-brand-500/40"
                      >
                        <Phone size={12} />
                        Call
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleRead(m.id, m.read)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs hover:border-brand-500/40"
                    >
                      {m.read ? <Mail size={12} /> : <MailOpen size={12} />}
                      {m.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(m.id)}
                      className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Confirm
        open={confirmId !== null}
        title="Delete this message?"
        description="This cannot be undone."
        onConfirm={onDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}

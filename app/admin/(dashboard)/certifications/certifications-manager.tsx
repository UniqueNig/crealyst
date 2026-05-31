"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import type { Certification } from "@prisma/client";
import { Button } from "@/components/admin/ui/button";
import { Field, Input, Label } from "@/components/admin/ui/field";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";

const CREATE = `mutation CreateCertification($input: CertificationInput!) { createCertification(input: $input) { id } }`;
const UPDATE = `mutation UpdateCertification($id: String!, $input: CertificationInput!) { updateCertification(id: $id, input: $input) { id } }`;
const DELETE = `mutation DeleteCertification($id: String!) { deleteCertification(id: $id) }`;

type Form = {
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string;
  order: number;
};

function toForm(c: Certification | null): Form {
  return {
    name: c?.name ?? "",
    issuer: c?.issuer ?? "",
    year: c?.year ?? "",
    credentialUrl: c?.credentialUrl ?? "",
    order: c?.order ?? 0,
  };
}

export function CertificationsManager({ items }: { items: Certification[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState<Certification | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, create] = useMutation(CREATE);
  const [, update] = useMutation(UPDATE);
  const [, del] = useMutation(DELETE);

  const onDelete = async () => {
    if (!confirmId) return;
    const r = await del({ id: confirmId });
    setConfirmId(null);
    if (r.error) show("error", r.error.message);
    else {
      show("success", "Removed.");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus size={14} />
          Add certification
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No certifications yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {c.issuer} · <span className="font-mono">{c.year}</span>
                </p>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
                  >
                    View credential
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(c.id)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <CertificationFormModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const input = {
              name: form.name.trim(),
              issuer: form.issuer.trim(),
              year: form.year.trim(),
              credentialUrl: form.credentialUrl.trim() || null,
              order: form.order,
            };
            const r =
              editing === "new"
                ? await create({ input })
                : await update({ id: editing.id, input });
            if (r.error) {
              show("error", r.error.message);
              return false;
            }
            show("success", editing === "new" ? "Added." : "Updated.");
            setEditing(null);
            router.refresh();
            return true;
          }}
        />
      )}

      <Confirm
        open={confirmId !== null}
        title="Delete this certification?"
        description="It will disappear from /about and your downloadable CV."
        onConfirm={onDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function CertificationFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Certification | null;
  onClose: () => void;
  onSubmit: (form: Form) => Promise<boolean>;
}) {
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSubmit(form);
          setBusy(false);
        }}
        className="my-8 flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {initial ? "Edit certification" : "New certification"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[color:var(--muted)] hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            placeholder="e.g. WordPress Developer"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="issuer">Issuer</Label>
            <Input
              id="issuer"
              required
              placeholder="e.g. Whogohost"
              value={form.issuer}
              onChange={(e) => set("issuer", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="year" hint='free form, e.g. "2023"'>
              Year
            </Label>
            <Input
              id="year"
              required
              placeholder="2023"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </Field>
        </div>

        <Field>
          <Label htmlFor="credentialUrl" hint="optional, link to certificate">
            Credential URL
          </Label>
          <Input
            id="credentialUrl"
            type="url"
            placeholder="https://…"
            value={form.credentialUrl}
            onChange={(e) => set("credentialUrl", e.target.value)}
          />
        </Field>

        <Field>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value))}
            className="w-24"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {initial ? "Save" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
}

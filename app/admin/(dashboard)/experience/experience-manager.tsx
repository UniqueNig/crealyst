"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Experience } from "@prisma/client";
import { Button } from "@/components/admin/ui/button";
import {
  Field,
  Input,
  Label,
  Textarea,
  Checkbox,
  TagInput,
} from "@/components/admin/ui/field";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";

const CREATE = `mutation CreateExperience($input: ExperienceInput!) { createExperience(input: $input) { id } }`;
const UPDATE = `mutation UpdateExperience($id: String!, $input: ExperienceInput!) { updateExperience(id: $id, input: $input) { id } }`;
const DELETE = `mutation DeleteExperience($id: String!) { deleteExperience(id: $id) }`;

type Form = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  bullets: string[];
  companyUrl: string;
  order: number;
};

function toForm(e: Experience | null): Form {
  return {
    company: e?.company ?? "",
    role: e?.role ?? "",
    location: e?.location ?? "",
    startDate: e?.startDate
      ? new Date(e.startDate).toISOString().slice(0, 10)
      : "",
    endDate: e?.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : "",
    isCurrent: e?.endDate == null,
    description: e?.description ?? "",
    bullets: e?.bullets ?? [],
    companyUrl: e?.companyUrl ?? "",
    order: e?.order ?? 0,
  };
}

function formatRange(start: Date | string, end: Date | string | null) {
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export function ExperienceManager({ items }: { items: Experience[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
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
          Add experience
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No experience entries yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold">
                  {e.role}
                  <span className="text-[color:var(--muted)]"> · {e.company}</span>
                </h3>
                <p className="mt-1 font-mono text-xs text-[color:var(--muted)]">
                  {formatRange(e.startDate, e.endDate)}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.description && (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {e.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(e)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(e.id)}
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
        <ExperienceFormModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const input = {
              company: form.company.trim(),
              role: form.role.trim(),
              location: form.location.trim() || null,
              startDate: new Date(form.startDate),
              endDate: form.isCurrent ? null : new Date(form.endDate),
              description: form.description.trim() || null,
              bullets: form.bullets.filter((b) => b.trim()),
              companyUrl: form.companyUrl.trim() || null,
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
        title="Delete this entry?"
        description="It will disappear from the public experience timeline."
        onConfirm={onDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function ExperienceFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Experience | null;
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
            {initial ? "Edit experience" : "New experience"}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              required
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              required
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Remote / City, Country"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="companyUrl" hint="optional">
              Company URL
            </Label>
            <Input
              id="companyUrl"
              type="url"
              value={form.companyUrl}
              onChange={(e) => set("companyUrl", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              disabled={form.isCurrent}
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
            <div className="mt-2">
              <Checkbox
                label="I currently work here"
                checked={form.isCurrent}
                onChange={(e) => set("isCurrent", e.target.checked)}
              />
            </div>
          </Field>
        </div>

        <Field>
          <Label htmlFor="description" hint="optional, 1-2 sentences">
            Description
          </Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <Field>
          <Label hint="press Enter after each one">Bullets</Label>
          <TagInput
            value={form.bullets}
            onChange={(next) => set("bullets", next)}
            placeholder="e.g. Shipped 10+ web apps"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Education } from "@prisma/client";
import { Button } from "@/components/admin/ui/button";
import { Field, Input, Label, Textarea } from "@/components/admin/ui/field";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";

const CREATE = `mutation CreateEducation($input: EducationInput!) { createEducation(input: $input) { id } }`;
const UPDATE = `mutation UpdateEducation($id: String!, $input: EducationInput!) { updateEducation(id: $id, input: $input) { id } }`;
const DELETE = `mutation DeleteEducation($id: String!) { deleteEducation(id: $id) }`;

type Form = {
  school: string;
  degree: string;
  range: string;
  location: string;
  description: string;
  order: number;
};

function toForm(e: Education | null): Form {
  return {
    school: e?.school ?? "",
    degree: e?.degree ?? "",
    range: e?.range ?? "",
    location: e?.location ?? "",
    description: e?.description ?? "",
    order: e?.order ?? 0,
  };
}

export function EducationManager({ items }: { items: Education[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState<Education | "new" | null>(null);
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
          Add education
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--border)] p-12 text-center text-sm text-[color:var(--muted)]">
          No education entries yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold">{e.school}</h3>
                <p className="mt-1 font-mono text-xs text-[color:var(--muted)]">
                  {e.range}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                <p className="mt-2 text-sm">{e.degree}</p>
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
        <EducationFormModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const input = {
              school: form.school.trim(),
              degree: form.degree.trim(),
              range: form.range.trim(),
              location: form.location.trim() || null,
              description: form.description.trim() || null,
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
        description="It will disappear from /about and your downloadable CV."
        onConfirm={onDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function EducationFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Education | null;
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
            {initial ? "Edit education" : "New education"}
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
          <Label htmlFor="school">School / institution</Label>
          <Input
            id="school"
            required
            placeholder="e.g. Moshood Abiola Polytechnic"
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
          />
        </Field>

        <Field>
          <Label htmlFor="degree">Degree / qualification</Label>
          <Input
            id="degree"
            required
            placeholder="e.g. HND, Electrical & Electronics Engineering"
            value={form.degree}
            onChange={(e) => set("degree", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="range" hint='e.g. "2019 – 2024"'>
              Date range
            </Label>
            <Input
              id="range"
              required
              placeholder="2019 – 2024"
              value={form.range}
              onChange={(e) => set("range", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="location" hint="optional">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Ojere, Ogun State"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
        </div>

        <Field>
          <Label htmlFor="description" hint="optional, e.g. focus areas, honours">
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

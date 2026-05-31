"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import type { Service } from "@prisma/client";
import { Field, Input, Label, Select, Textarea, Checkbox, TagInput } from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";
import { useToast } from "@/components/admin/ui/toast";

const CREATE = `mutation CreateService($input: ServiceInput!) { createService(input: $input) { id } }`;
const UPDATE = `mutation UpdateService($id: String!, $input: ServiceInput!) { updateService(id: $id, input: $input) { id } }`;

const ICONS = ["Code2", "Server", "Sparkles", "Compass"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Form = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  featured: boolean;
  published: boolean;
};

function toForm(s: Service | null): Form {
  return {
    slug: s?.slug ?? "",
    title: s?.title ?? "",
    description: s?.description ?? "",
    icon: s?.icon ?? "Sparkles",
    features: s?.features ?? [],
    order: s?.order ?? 0,
    featured: s?.featured ?? true,
    published: s?.published ?? true,
  };
}

export function ServiceForm({ initial }: { initial: Service | null }) {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [{ fetching: creating }, create] = useMutation(CREATE);
  const [{ fetching: updating }, update] = useMutation(UPDATE);
  const busy = creating || updating;

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || null,
      features: form.features.filter((f) => f.trim()),
      order: form.order,
      featured: form.featured,
      published: form.published,
    };
    const r = initial
      ? await update({ id: initial.id, input })
      : await create({ input });
    if (r.error) {
      show("error", r.error.message);
    } else {
      show("success", initial ? "Service updated." : "Service created.");
      router.push("/admin/services");
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
          <Field>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!initial && !form.slug)
                  set("slug", slugify(e.target.value));
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="slug" hint="URL identifier">
              Slug
            </Label>
            <Input
              id="slug"
              required
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor="icon">Icon</Label>
          <Select
            id="icon"
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
          >
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label hint="press Enter after each one">Features</Label>
          <TagInput
            value={form.features}
            onChange={(next) => set("features", next)}
            placeholder="e.g. Next.js, React, Tailwind"
          />
        </Field>
      </section>

      <section className="flex items-center gap-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <Checkbox
          label="Published"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        <Checkbox
          label="Featured on home"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
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
      </section>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/services")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {initial ? "Save changes" : "Create service"}
        </Button>
      </div>
    </form>
  );
}

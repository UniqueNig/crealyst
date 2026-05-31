"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import type { Project } from "@prisma/client";
import {
  Field,
  Input,
  Label,
  Textarea,
  Checkbox,
  TagInput,
} from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";
import { ImageUpload, MultiImageUpload } from "@/components/admin/upload";
import { useToast } from "@/components/admin/ui/toast";

const CREATE = `mutation CreateProject($input: ProjectInput!) { createProject(input: $input) { id } }`;
const UPDATE = `mutation UpdateProject($id: String!, $input: ProjectInput!) { updateProject(id: $id, input: $input) { id } }`;

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
  summary: string;
  description: string;
  role: string;
  year: number;
  liveUrl: string;
  repoUrl: string;
  coverImage: string;
  gallery: string[];
  techStack: string[];
  tags: string[];
  order: number;
  featured: boolean;
  published: boolean;
  metaTitle: string;
  metaDesc: string;
};

function toForm(p: Project | null): Form {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    summary: p?.summary ?? "",
    description: p?.description ?? "",
    role: p?.role ?? "",
    year: p?.year ?? new Date().getFullYear(),
    liveUrl: p?.liveUrl ?? "",
    repoUrl: p?.repoUrl ?? "",
    coverImage: p?.coverImage ?? "",
    gallery: p?.gallery ?? [],
    techStack: p?.techStack ?? [],
    tags: p?.tags ?? [],
    order: p?.order ?? 0,
    featured: p?.featured ?? false,
    published: p?.published ?? true,
    metaTitle: p?.metaTitle ?? "",
    metaDesc: p?.metaDesc ?? "",
  };
}

export function ProjectForm({ initial }: { initial: Project | null }) {
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
    if (!form.coverImage) {
      show("error", "Cover image is required.");
      return;
    }
    const input = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      role: form.role.trim(),
      year: Number(form.year),
      liveUrl: form.liveUrl.trim() || null,
      repoUrl: form.repoUrl.trim() || null,
      coverImage: form.coverImage,
      gallery: form.gallery,
      techStack: form.techStack,
      tags: form.tags,
      order: form.order,
      featured: form.featured,
      published: form.published,
      metaTitle: form.metaTitle.trim() || null,
      metaDesc: form.metaDesc.trim() || null,
    };
    const r = initial
      ? await update({ id: initial.id, input })
      : await create({ input });
    if (r.error) {
      show("error", r.error.message);
    } else {
      show("success", initial ? "Project updated." : "Project created.");
      router.push("/admin/projects");
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Core
        </h2>
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
          <Label htmlFor="summary" hint="one-liner shown on cards">
            Summary
          </Label>
          <Input
            id="summary"
            required
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor="description" hint="long-form, shown on case-study page">
            Description
          </Label>
          <Textarea
            id="description"
            required
            rows={6}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="role">Your role</Label>
            <Input
              id="role"
              required
              placeholder="e.g. Solo Full-Stack Engineer"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              required
              value={form.year}
              onChange={(e) => set("year", Number(e.target.value))}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Media
        </h2>
        <ImageUpload
          label="Cover image"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
        />
        <MultiImageUpload
          label="Gallery (optional)"
          value={form.gallery}
          onChange={(urls) => set("gallery", urls)}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Links & stack
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="liveUrl" hint="optional">
              Live URL
            </Label>
            <Input
              id="liveUrl"
              type="url"
              placeholder="https://…"
              value={form.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="repoUrl" hint="optional">
              Repository URL
            </Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/…"
              value={form.repoUrl}
              onChange={(e) => set("repoUrl", e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <Label hint="press Enter after each one">Tech stack</Label>
          <TagInput
            value={form.techStack}
            onChange={(next) => set("techStack", next)}
            placeholder="e.g. Next.js"
          />
        </Field>
        <Field>
          <Label hint="high-level category — visitors use these to filter your projects">
            Tags
          </Label>
          <TagInput
            value={form.tags}
            onChange={(next) => set("tags", next)}
            placeholder="e.g. Web, Mobile, AI, Brand Design"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          SEO (optional)
        </h2>
        <Field>
          <Label htmlFor="metaTitle" hint="overrides title in browser tab">
            Meta title
          </Label>
          <Input
            id="metaTitle"
            value={form.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor="metaDesc" hint="overrides summary for search engines">
            Meta description
          </Label>
          <Textarea
            id="metaDesc"
            rows={2}
            value={form.metaDesc}
            onChange={(e) => set("metaDesc", e.target.value)}
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
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {initial ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

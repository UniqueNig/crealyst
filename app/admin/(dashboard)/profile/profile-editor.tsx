"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import type { Profile } from "@prisma/client";
import { Field, Input, Label, Textarea } from "@/components/admin/ui/field";
import { Button } from "@/components/admin/ui/button";
import { ImageUpload } from "@/components/admin/upload";
import { FileUpload } from "@/components/admin/file-upload";
import { useToast } from "@/components/admin/ui/toast";

const UPSERT_PROFILE = `
  mutation UpsertProfile($input: ProfileInput!) {
    upsertProfile(input: $input) { id }
  }
`;

type Form = {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  avatarUrl: string;
  resumeUrl: string;
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  dribbble: string;
};

function toForm(p: Profile | null): Form {
  return {
    name: p?.name ?? "",
    title: p?.title ?? "",
    tagline: p?.tagline ?? "",
    bio: p?.bio ?? "",
    email: p?.email ?? "",
    location: p?.location ?? "",
    avatarUrl: p?.avatarUrl ?? "",
    resumeUrl: p?.resumeUrl ?? "",
    github: p?.github ?? "",
    linkedin: p?.linkedin ?? "",
    twitter: p?.twitter ?? "",
    instagram: p?.instagram ?? "",
    dribbble: p?.dribbble ?? "",
  };
}

export function ProfileEditor({ initial }: { initial: Profile | null }) {
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [{ fetching }, upsert] = useMutation(UPSERT_PROFILE);
  const { show } = useToast();
  const router = useRouter();

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name: form.name.trim(),
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      bio: form.bio.trim(),
      email: form.email.trim(),
      location: form.location.trim() || null,
      avatarUrl: form.avatarUrl.trim() || null,
      resumeUrl: form.resumeUrl.trim() || null,
      github: form.github.trim() || null,
      linkedin: form.linkedin.trim() || null,
      twitter: form.twitter.trim() || null,
      instagram: form.instagram.trim() || null,
      dribbble: form.dribbble.trim() || null,
    };
    const result = await upsert({ input });
    if (result.error) {
      show("error", result.error.message);
    } else {
      show("success", "Profile saved.");
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Identity
        </h2>
        <ImageUpload
          label="Profile photo"
          value={form.avatarUrl}
          onChange={(url) => set("avatarUrl", url)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="title">Role / title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            required
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            required
            rows={6}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Contact & location
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
        </div>
        <FileUpload
          label="Résumé / CV"
          value={form.resumeUrl}
          onChange={(url) => set("resumeUrl", url)}
          allowedFormats={["pdf", "doc", "docx"]}
          folder="portfolio/resume"
        />
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Social
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["github", "GitHub"],
              ["linkedin", "LinkedIn"],
              ["twitter", "Twitter / X"],
              ["instagram", "Instagram"],
              ["dribbble", "Dribbble"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="url"
                placeholder="https://…"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={fetching}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

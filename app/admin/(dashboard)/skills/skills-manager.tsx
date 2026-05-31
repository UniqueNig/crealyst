"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import Image from "next/image";
import { Plus, Trash2, Check, Search } from "lucide-react";
import type { Skill, SkillCategory } from "@prisma/client";
import {
  type CatalogSkill,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  isMonochromeIcon,
} from "@/lib/skills-catalog";
import { Button } from "@/components/admin/ui/button";
import { Field, Input, Label, Select } from "@/components/admin/ui/field";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";

const ADD_FROM_CATALOG = `
  mutation AddFromCatalog($key: String!) {
    addSkillFromCatalog(key: $key) { id }
  }
`;
const CREATE_SKILL = `
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) { id }
  }
`;
const DELETE_SKILL = `
  mutation DeleteSkill($id: String!) {
    deleteSkill(id: $id)
  }
`;

const CATEGORIES: SkillCategory[] = CATEGORY_ORDER;

export function SkillsManager({
  skills,
  catalog,
}: {
  skills: Skill[];
  catalog: CatalogSkill[];
}) {
  const router = useRouter();
  const { show } = useToast();
  const [, addCatalog] = useMutation(ADD_FROM_CATALOG);
  const [, createSkill] = useMutation(CREATE_SKILL);
  const [, deleteSkill] = useMutation(DELETE_SKILL);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState({
    name: "",
    category: "FRAMEWORK" as SkillCategory,
    iconUrl: "",
  });

  const existingNames = new Set(skills.map((s) => s.name));

  // Pre-filter the catalog by the search term so the render below is dumb.
  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.key.includes(q)
    );
  }, [catalog, query]);

  const onAddCatalog = async (key: string) => {
    setBusyKey(key);
    const r = await addCatalog({ key });
    setBusyKey(null);
    if (r.error) show("error", r.error.message);
    else {
      show("success", "Added.");
      router.refresh();
    }
  };

  const onCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custom.name.trim()) return;
    const r = await createSkill({
      input: {
        name: custom.name.trim(),
        category: custom.category,
        iconUrl: custom.iconUrl.trim() || null,
      },
    });
    if (r.error) {
      show("error", r.error.message);
    } else {
      show("success", "Skill added.");
      setCustom({ name: "", category: "FRAMEWORK", iconUrl: "" });
      router.refresh();
    }
  };

  const onDelete = async () => {
    if (!confirmId) return;
    const r = await deleteSkill({ id: confirmId });
    setConfirmId(null);
    if (r.error) show("error", r.error.message);
    else {
      show("success", "Removed.");
      router.refresh();
    }
  };

  const grouped = filteredCatalog.reduce<Record<string, CatalogSkill[]>>(
    (acc, s) => {
      (acc[s.category] ||= []).push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Current skills */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Your skills ({skills.length})
        </h2>
        {skills.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-center text-sm text-[color:var(--muted)]">
            No skills yet. Pick some from the catalog below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <div
                key={s.id}
                className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] py-1.5 pl-3 pr-2 text-sm"
              >
                {s.iconUrl ? (
                  <Image
                    src={s.iconUrl}
                    alt=""
                    width={14}
                    height={14}
                    className={
                      "size-3.5" +
                      (isMonochromeIcon(s.iconUrl) ? " dark:invert" : "")
                    }
                    unoptimized
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-brand-500" />
                )}
                {s.name}
                <button
                  type="button"
                  onClick={() => setConfirmId(s.id)}
                  className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500"
                  aria-label={`Remove ${s.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Catalog picker */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            Add from catalog
          </h2>
          <span className="text-xs text-[color:var(--muted)]">
            {filteredCatalog.length} of {catalog.length}
          </span>
        </div>

        {/* Search across all disciplines — works on name, key, or category. */}
        <div className="relative mb-5">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, tools, software, platforms…"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] py-2.5 pl-9 pr-4 text-sm transition-colors focus:border-brand-500 focus:outline-none"
            aria-label="Search catalog"
          />
        </div>

        {filteredCatalog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-center text-sm text-[color:var(--muted)]">
            Nothing matches &ldquo;{query}&rdquo;. Add it as a custom skill
            below.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
              <div key={cat}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {grouped[cat].map((c) => {
                    const added = existingNames.has(c.name);
                    const busy = busyKey === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        disabled={added || busy}
                        onClick={() => onAddCatalog(c.key)}
                        className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                          added
                            ? "border-brand-500/30 bg-brand-500/5 text-brand-500"
                            : "border-[color:var(--border)] bg-[color:var(--surface)] hover:-translate-y-0.5 hover:border-brand-500/40"
                        }`}
                      >
                        <Image
                          src={c.iconUrl}
                          alt=""
                          width={18}
                          height={18}
                          className={
                            "size-4 shrink-0" +
                            (isMonochromeIcon(c.iconUrl) ? " dark:invert" : "")
                          }
                          unoptimized
                        />
                        <span className="flex-1 truncate">{c.name}</span>
                        {added && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Custom skill */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          Add custom
        </h2>
        <form
          onSubmit={onCreateCustom}
          className="flex flex-col gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:flex-row sm:items-end"
        >
          <Field>
            <Label htmlFor="custom-name">Name</Label>
            <Input
              id="custom-name"
              placeholder="e.g. Svelte"
              value={custom.name}
              onChange={(e) =>
                setCustom((p) => ({ ...p, name: e.target.value }))
              }
            />
          </Field>
          <Field>
            <Label htmlFor="custom-category">Category</Label>
            <Select
              id="custom-category"
              value={custom.category}
              onChange={(e) =>
                setCustom((p) => ({
                  ...p,
                  category: e.target.value as SkillCategory,
                }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="custom-icon" hint="optional">
              Icon URL
            </Label>
            <Input
              id="custom-icon"
              placeholder="https://…"
              value={custom.iconUrl}
              onChange={(e) =>
                setCustom((p) => ({ ...p, iconUrl: e.target.value }))
              }
            />
          </Field>
          <Button type="submit">
            <Plus size={14} />
            Add
          </Button>
        </form>
      </section>

      <Confirm
        open={confirmId !== null}
        title="Remove this skill?"
        description="It will disappear from your About page and the home page stack chips."
        confirmLabel="Remove"
        onConfirm={onDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

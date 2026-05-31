"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  completeOnboardingAction,
  type WelcomeState,
} from "@/lib/actions/welcome";
import { Field, FieldError, Input, Label, Textarea } from "@/components/admin/ui/field";

const initial: WelcomeState = { status: "idle" };

type Initial = {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Saving…
        </>
      ) : (
        "Save and continue"
      )}
    </button>
  );
}

export function WelcomeForm({
  initial: defaults,
  username,
}: {
  initial: Initial;
  username: string;
}) {
  const [state, formAction] = useActionState(completeOnboardingAction, initial);
  const [bio, setBio] = useState(defaults.bio);
  const fe = state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field>
        <Label htmlFor="name" hint="how it appears on your portfolio">
          Display name
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          defaultValue={defaults.name}
          placeholder="e.g. Jane Doe"
        />
        <FieldError message={fe.name} />
      </Field>

      <Field>
        <Label htmlFor="title" hint="role, position, or what you do">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={80}
          defaultValue={defaults.title}
          placeholder="e.g. Full-stack engineer"
        />
        <FieldError message={fe.title} />
      </Field>

      <Field>
        <Label htmlFor="tagline" hint="one short sentence">
          Tagline
        </Label>
        <Input
          id="tagline"
          name="tagline"
          required
          maxLength={140}
          defaultValue={defaults.tagline}
          placeholder="e.g. I build calm, useful software for the web."
        />
        <FieldError message={fe.tagline} />
      </Field>

      <Field>
        <Label htmlFor="bio" hint="2–4 sentences is plenty">
          About you
        </Label>
        <Textarea
          id="bio"
          name="bio"
          required
          rows={5}
          minLength={30}
          maxLength={1200}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Where you work, what you focus on, what you care about."
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-[color:var(--muted)]">
          <span>{bio.length < 30 ? `${30 - bio.length} more characters` : "Looks good."}</span>
          <span>{bio.length} / 1200</span>
        </div>
        <FieldError message={fe.bio} />
      </Field>

      <Field>
        <Label htmlFor="location" hint="optional">
          Location
        </Label>
        <Input
          id="location"
          name="location"
          maxLength={80}
          defaultValue={defaults.location}
          placeholder="e.g. Lagos, Nigeria"
        />
      </Field>

      {state.status === "error" && !state.fieldErrors && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-500">
          {state.message}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm text-[color:var(--muted)] hover:text-foreground"
        >
          Skip for now
        </Link>
        <SubmitButton />
      </div>

      <p className="mt-2 text-center text-[11px] text-[color:var(--muted)]">
        Your portfolio is at{" "}
        <span className="font-mono">/u/{username}</span> — visit anytime from the
        dashboard.
      </p>
    </form>
  );
}

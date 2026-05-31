"use client";

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-[color:var(--muted)]"
    >
      {children}
      {hint && (
        <span className="ml-1 text-[color:var(--muted)]/60">— {hint}</span>
      )}
    </label>
  );
}

const baseField =
  "w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none disabled:opacity-60";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseField, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(baseField, "resize-y", props.className)}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(baseField, props.className)} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

export function Checkbox({
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm">
      <input
        type="checkbox"
        {...rest}
        className="size-4 rounded border-[color:var(--border)] bg-[color:var(--background)] accent-brand-500"
      />
      {label}
    </label>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-2">
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs text-brand-500"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-brand-500/70 hover:text-brand-500"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-[color:var(--muted)]"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const v = e.currentTarget.value.trim();
            if (v && !value.includes(v)) onChange([...value, v]);
            e.currentTarget.value = "";
          } else if (e.key === "Backspace" && !e.currentTarget.value) {
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}

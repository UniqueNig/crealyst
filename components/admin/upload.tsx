"use client";

import Image from "next/image";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function ImageUpload({ value, onChange, label = "Image" }: Props) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-[color:var(--muted)]">
        {label}
      </p>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative size-24 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)]">
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex size-24 items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)]">
            <Upload size={20} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            options={{
              folder: "portfolio",
              sources: ["local", "url", "camera"],
              maxFiles: 1,
            }}
            onSuccess={(result: CloudinaryUploadWidgetResults) => {
              const info = result.info;
              if (typeof info === "object" && info && "secure_url" in info) {
                onChange(info.secure_url as string);
              }
            }}
          >
            {({ open }) => (
              <Button
                type="button"
                variant="secondary"
                onClick={() => open()}
              >
                <Upload size={14} />
                {value ? "Replace" : "Upload image"}
              </Button>
            )}
          </CldUploadWidget>
          <p className="text-[11px] text-[color:var(--muted)]">
            JPG, PNG, or WebP. Stored on Cloudinary.
          </p>
        </div>
      </div>
    </div>
  );
}

export function MultiImageUpload({
  value,
  onChange,
  label = "Gallery",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-[color:var(--muted)]">
        {label}
      </p>
      <div className="flex flex-wrap items-start gap-3">
        {value.map((url, i) => (
          <div
            key={url}
            className="relative size-20 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)]"
          >
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          options={{
            folder: "portfolio",
            sources: ["local", "url"],
            multiple: true,
          }}
          onSuccess={(result: CloudinaryUploadWidgetResults) => {
            const info = result.info;
            if (typeof info === "object" && info && "secure_url" in info) {
              const url = info.secure_url as string;
              if (!value.includes(url)) onChange([...value, url]);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-brand-500/40 hover:text-foreground"
            >
              <Upload size={16} />
              <span className="text-[10px]">Add</span>
            </button>
          )}
        </CldUploadWidget>
      </div>
    </div>
  );
}

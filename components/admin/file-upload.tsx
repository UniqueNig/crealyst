"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { FileText, Upload, X, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Comma-separated list of extensions Cloudinary's widget will accept */
  allowedFormats?: string[];
  folder?: string;
};

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "file");
  } catch {
    return "file";
  }
}

export function FileUpload({
  value,
  onChange,
  label = "File",
  allowedFormats = ["pdf", "doc", "docx"],
  folder = "portfolio/files",
}: Props) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-[color:var(--muted)]">
        {label}
      </p>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <FileText size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{filenameFromUrl(value)}</p>
            <a
              href={value}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-[color:var(--muted)] hover:text-brand-500"
            >
              Open in new tab <ExternalLink size={10} />
            </a>
          </div>
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            options={{
              folder,
              resourceType: "auto",
              sources: ["local", "url"],
              clientAllowedFormats: allowedFormats,
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
                Replace
              </Button>
            )}
          </CldUploadWidget>
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <span className="inline-flex size-10 items-center justify-center rounded-lg text-[color:var(--muted)]">
            <FileText size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm text-[color:var(--muted)]">
              No file uploaded yet.
            </p>
            <p className="text-[11px] text-[color:var(--muted)]/70">
              {allowedFormats.map((f) => f.toUpperCase()).join(", ")} — stored on Cloudinary.
            </p>
          </div>
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            options={{
              folder,
              resourceType: "auto",
              sources: ["local", "url"],
              clientAllowedFormats: allowedFormats,
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
              <Button type="button" variant="secondary" onClick={() => open()}>
                <Upload size={14} />
                Upload
              </Button>
            )}
          </CldUploadWidget>
        </div>
      )}
    </div>
  );
}

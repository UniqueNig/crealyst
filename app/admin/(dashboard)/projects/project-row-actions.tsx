"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { Trash2 } from "lucide-react";
import { Confirm } from "@/components/admin/ui/confirm";
import { useToast } from "@/components/admin/ui/toast";

const DELETE = `mutation DeleteProject($id: String!) { deleteProject(id: $id) }`;

export function ProjectRowActions({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [, del] = useMutation(DELETE);
  const { show } = useToast();
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
      <Confirm
        open={open}
        title={`Delete "${title}"?`}
        description="This removes the project and its case-study page permanently."
        onConfirm={async () => {
          const r = await del({ id });
          setOpen(false);
          if (r.error) show("error", r.error.message);
          else {
            show("success", "Deleted.");
            router.refresh();
          }
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

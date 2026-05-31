"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error";
type Toast = { id: string; kind: ToastKind; message: string };

const ToastCtx = createContext<{
  show: (kind: ToastKind, message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      kind === "error" ? 6000 : 3000
    );
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
          />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border bg-[color:var(--surface)] px-4 py-3 shadow-lg transition-all duration-200",
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        toast.kind === "success"
          ? "border-brand-500/40"
          : "border-red-500/40 bg-red-500/5"
      )}
    >
      {toast.kind === "success" ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-500" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
      )}
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-[color:var(--muted)] hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

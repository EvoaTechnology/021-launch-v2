"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "durationMs">> {
  id: string;
  durationMs: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      durationMs = 3500,
    }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        title: title ?? "",
        description: description ?? "",
        variant,
        durationMs,
      };
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => dismiss(id), durationMs);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-[min(380px,90vw)]">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`group relative w-full overflow-hidden rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md
            ${
              t.variant === "success"
                ? "bg-emerald-600/15 border-emerald-400/30"
                : t.variant === "error"
                ? "bg-rose-600/15 border-rose-400/30"
                : t.variant === "warning"
                ? "bg-amber-600/15 border-amber-400/30"
                : "bg-white/10 border-white/20"
            }`}>
            <div className="pr-6">
              {t.title && (
                <div className="text-sm font-semibold text-white/90">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className="text-xs text-white/80 mt-0.5">
                  {t.description}
                </div>
              )}
            </div>
            <button
              aria-label="Dismiss"
              className="absolute top-2 right-2 text-white/60 hover:text-white/90"
              onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

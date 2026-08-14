"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" />,
  error: <XCircle className="size-5 text-error" />,
  warning: <TriangleAlert className="size-5 text-warning" />,
  info: <Info className="size-5 text-info" />,
};

const BORDER: Record<ToastVariant, string> = {
  success: "border-l-success",
  error: "border-l-error",
  warning: "border-l-warning",
  info: "border-l-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...item, id }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5">
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className={clsx(
                  "flex items-start gap-3 rounded-card border-l-4 bg-white p-4 shadow-elevated",
                  BORDER[t.variant],
                )}
              >
                {ICONS[t.variant]}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Cerrar notificación"
                  className="text-gray-300 hover:text-gray-500"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

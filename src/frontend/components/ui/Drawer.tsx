"use client";

import { ReactNode, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  /** Oculta la cabecera con título; útil cuando el contenido trae su propia cabecera (ej. Sidebar) */
  hideHeader?: boolean;
  /** Quita el padding del área de contenido */
  noPadding?: boolean;
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  size = "md",
  hideHeader = false,
  noPadding = false,
}: DrawerProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 transition-opacity",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={clsx(
          "absolute top-0 flex h-full w-full flex-col bg-white shadow-elevated transition-transform duration-300",
          SIZE_CLASSES[size],
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        {hideHeader ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-card transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="size-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div
          className={clsx("flex-1 overflow-y-auto", !noPadding && "px-5 py-4")}
        >
          {children}
        </div>

        {footer && (
          <div className="border-t border-gray-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

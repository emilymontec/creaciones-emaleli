"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
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

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={clsx(
          "relative w-full rounded-modal bg-white p-6 shadow-modal",
          SIZE_CLASSES[size],
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-4" />
        </button>

        {title && (
          <h2
            id="modal-title"
            className="pr-8 font-display text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}

        <div className={clsx(title || description ? "mt-4" : "")}>
          {children}
        </div>

        {footer && (
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

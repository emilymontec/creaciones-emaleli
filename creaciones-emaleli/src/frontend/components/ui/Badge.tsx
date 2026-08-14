import { HTMLAttributes } from "react";
import clsx from "clsx";

export type BadgeVariant =
  "neutral" | "primary" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-gray-100 text-gray-700",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-light text-green-800",
  warning: "bg-warning-light text-amber-800",
  error: "bg-error-light text-red-800",
  info: "bg-info-light text-sky-800",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  "primary" | "secondary" | "accent" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500",
  secondary:
    "bg-secondary-400 text-white hover:bg-secondary-500 focus-visible:outline-secondary-400",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 focus-visible:outline-accent-500",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-300",
  destructive:
    "bg-error text-white hover:bg-error/90 focus-visible:outline-error",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={clsx(
          "inline-flex items-center justify-center rounded-button font-semibold transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);

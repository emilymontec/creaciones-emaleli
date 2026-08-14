import clsx from "clsx";
import { Loader2 } from "lucide-react";

export function Spinner({
  className,
  label = "Cargando...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" className="inline-flex items-center gap-2">
      <Loader2
        className={clsx("size-5 animate-spin text-primary-500", className)}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Loader({
  className,
  size = "md",
  label = "Cargando...",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  };
  return (
    <div role="status" className="inline-flex items-center gap-2">
      <Loader2
        className={clsx("animate-spin text-primary-500", sizeClasses[size], className)}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("animate-pulse rounded-input bg-gray-200/80", className)}
    />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}

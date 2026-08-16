import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  href?: string;
  /** Clases del círculo del icono (por defecto degradado pastel de marca) */
  iconClass?: string;
  className?: string;
}

const DEFAULT_ICON_CLASS =
  "bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  iconClass,
  className,
}: StatCardProps) {
  const inner = (
    <Card
      className={clsx(
        "flex h-full items-center gap-4 transition-transform duration-200",
        href && "hover:-translate-y-0.5",
        className,
      )}
    >
      <span
        className={clsx(
          "flex size-12 shrink-0 items-center justify-center rounded-xl ring-2 ring-white shadow-card",
          iconClass ?? DEFAULT_ICON_CLASS,
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-500">{label}</p>
        <p className="truncate font-display text-xl font-bold text-gray-900 tabular-nums">
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{hint}</p>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

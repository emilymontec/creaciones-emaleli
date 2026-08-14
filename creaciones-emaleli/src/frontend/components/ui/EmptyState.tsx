import { ReactNode } from "react";
import { PackageSearch } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        {icon ?? <PackageSearch className="size-6" aria-hidden />}
      </div>
      <p className="font-display text-base font-semibold text-gray-900">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

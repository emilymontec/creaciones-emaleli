import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, action, icon: Icon }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100 text-primary-700 ring-1 ring-primary-100">
              <Icon className="size-5" />
            </span>
          )}
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-3 h-1 w-14 rounded-pill bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500" />
      </div>

      {action}
    </div>
  );
}

"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageList(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("...");
    result.push(p);
  });
  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-1"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="flex size-9 items-center justify-center rounded-input text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      {getPageList(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={clsx(
              "flex size-9 items-center justify-center rounded-input text-sm font-medium transition-colors",
              p === page
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex size-9 items-center justify-center rounded-input text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

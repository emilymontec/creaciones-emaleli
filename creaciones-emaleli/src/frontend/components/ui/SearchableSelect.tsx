"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { SelectOption } from "./Select";

export interface SearchableSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  /** Modo de selección múltiple (matriz de categorías, variantes, etc.) */
  multiple?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Combobox buscable con soporte de selección simple o múltiple.
 * Usado, por ejemplo, para asociar un producto a una o varias categorías.
 */
export function SearchableSelect({
  label,
  error,
  placeholder = "Buscar...",
  options,
  multiple = false,
  value,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, query],
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  function toggle(optionValue: string) {
    if (multiple) {
      onChange(
        value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue],
      );
    } else {
      onChange([optionValue]);
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-input border bg-white px-3 py-2 text-left text-sm shadow-sm outline-none transition-colors",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
          error ? "border-error" : "border-gray-200",
        )}
      >
        {selectedOptions.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}

        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
          >
            {option.label}
            {multiple && (
              <X
                className="size-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(option.value);
                }}
              />
            )}
          </span>
        ))}

        <ChevronDown className="ml-auto size-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-card border border-gray-100 bg-white p-2 shadow-elevated">
          <div className="mb-2 flex items-center gap-2 rounded-input border border-gray-200 px-2.5 py-1.5">
            <Search className="size-3.5 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para filtrar..."
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-2 py-1.5 text-sm text-gray-400">
                Sin resultados
              </li>
            )}
            {filtered.map((option) => {
              const active = value.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-input px-2.5 py-1.5 text-left text-sm hover:bg-primary-50",
                      active && "font-medium text-primary-700",
                    )}
                  >
                    {option.label}
                    {active && <Check className="size-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}

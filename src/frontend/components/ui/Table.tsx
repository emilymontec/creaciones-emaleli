"use client";

import { ReactNode, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { SkeletonTable } from "./Loader";
import { EmptyState } from "./EmptyState";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  /** Función usada para ordenar cuando sortable=true */
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Acciones por fila, renderizadas en la última columna */
  actions?: (row: T) => ReactNode;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectedKeysChange?: (keys: string[]) => void;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay datos para mostrar todavía.",
  actions,
  selectable = false,
  selectedKeys = [],
  onSelectedKeysChange,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });

    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [data, sortKey, sortDir, columns]);

  function toggleSort(column: TableColumn<T>) {
    if (!column.sortable) return;
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  function toggleAll() {
    if (!onSelectedKeysChange) return;
    onSelectedKeysChange(
      selectedKeys.length === data.length ? [] : data.map(rowKey),
    );
  }

  function toggleOne(key: string) {
    if (!onSelectedKeysChange) return;
    onSelectedKeysChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key],
    );
  }

  if (loading) {
    return <SkeletonTable rows={6} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-gray-100 shadow-card">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gradient-to-br from-gray-50/80 to-white">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={
                    selectedKeys.length === data.length && data.length > 0
                  }
                  onChange={toggleAll}
                  aria-label="Seleccionar todo"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  "px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500",
                  column.sortable && "cursor-pointer select-none",
                  column.className,
                )}
                onClick={() => toggleSort(column)}
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {column.sortable &&
                    (sortKey === column.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 text-gray-300" />
                    ))}
                </span>
              </th>
            ))}
            {actions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedKeys.includes(key)}
                      onChange={() => toggleOne(key)}
                      aria-label="Seleccionar fila"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      "px-4 py-3 text-gray-700",
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">{actions(row)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

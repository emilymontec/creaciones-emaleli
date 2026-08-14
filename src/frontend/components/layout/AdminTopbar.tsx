"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { AdminBreadcrumb } from "./AdminBreadcrumb";

interface AdminTopbarProps {
  userName: string;
  onOpenMobileNav: () => void;
}

export function AdminTopbar({ userName, onOpenMobileNav }: AdminTopbarProps) {
  const [hasNotifications] = useState(true);
  const [query, setQuery] = useState("");
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="flex size-9 shrink-0 items-center justify-center rounded-input text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Abrir menú de navegación"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden shrink-0 lg:block">
        <AdminBreadcrumb />
      </div>

      {/*
        Buscador global: la UI ya está lista; se conecta a un índice real
        (productos, pedidos, clientes) cuando esos módulos existan en
        Fase 3+. Por ahora resuelve búsquedas locales de las secciones
        del propio menú de navegación.
      */}
      <label className="relative ml-auto flex w-full max-w-xs items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en el panel..."
          className="w-full rounded-input border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
      </label>

      <button
        type="button"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-input text-gray-500 hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <Bell className="size-[18px]" />
        {hasNotifications && (
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent-500" />
        )}
      </button>

      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
        {initials || "AD"}
      </div>
    </header>
  );
}

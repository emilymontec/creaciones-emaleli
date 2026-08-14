"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { ADMIN_NAV_SECTIONS } from "./admin-nav";

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
  /** Server Action de logout, pasada desde el layout de servidor */
  logoutAction: () => Promise<void>;
  /** Cuando se usa dentro del Drawer mobile no debe mostrarse el botón de colapsar */
  variant?: "desktop" | "mobile";
}

const STORAGE_KEY = "emaleli:admin-sidebar-collapsed";

export function AdminSidebar({
  userName,
  userEmail,
  logoutAction,
  variant = "desktop",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (variant !== "desktop") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Sincroniza con la preferencia persistida en localStorage (sistema
    // externo al render de React), por eso el setState vive en el efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
  }, [variant]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isCollapsed = variant === "desktop" && collapsed;

  return (
    <aside
      className={clsx(
        "flex h-full flex-col border-r border-gray-100 bg-white transition-[width] duration-200",
        variant === "desktop" && (isCollapsed ? "w-[76px]" : "w-64"),
        variant === "mobile" && "w-full",
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-3 border-b border-gray-100 px-4 py-5",
          isCollapsed && "justify-center px-2",
        )}
      >
        <Image
          src="/brand/logo-emaleli.png"
          alt="Creaciones Emaleli"
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight text-gray-900">
              CREACIONES
            </p>
            <p className="truncate font-display text-base font-bold leading-tight text-primary-600">
              creaciones emaleli
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.title && !isCollapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      "flex items-center gap-3 rounded-input px-3 py-2.5 text-sm font-semibold transition-colors",
                      isCollapsed && "justify-center px-0",
                      active
                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-card"
                        : "text-gray-500 hover:bg-primary-50 hover:text-primary-700",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        {variant === "desktop" && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className={clsx(
              "mb-2 flex w-full items-center gap-2 rounded-input px-3 py-2 text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600",
              isCollapsed && "justify-center px-0",
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <>
                <ChevronsLeft className="size-4" />
                Colapsar menú
              </>
            )}
          </button>
        )}

        {!isCollapsed && (
          <div className="mb-2 truncate rounded-input bg-gray-50 px-3 py-2">
            <p className="truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={clsx(
              "flex w-full items-center gap-2 rounded-input bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200",
              isCollapsed && "justify-center px-0",
            )}
          >
            <LogOut className="size-4" />
            {!isCollapsed && "Cerrar sesión"}
          </button>
        </form>
      </div>
    </aside>
  );
}

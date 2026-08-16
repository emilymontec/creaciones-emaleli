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
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        "relative flex h-full flex-col border-r border-gray-100 bg-white transition-[width] duration-200",
        variant === "desktop" && (isCollapsed ? "w-[76px]" : "w-64"),
        variant === "desktop" && "lg:sticky lg:top-0 lg:h-screen",
        variant === "mobile" && "w-full",
      )}
    >
      {/* Línea de acento de marca */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-marquee-gradient"
        aria-hidden
      />

      <div
        className={clsx(
          "flex items-center gap-3 px-4 pb-4 pt-6",
          isCollapsed && "justify-center px-2",
        )}
      >
        <div className="relative shrink-0 rounded-xl bg-gradient-to-br from-accent-100 via-primary-100 to-secondary-100 p-[2px]">
          <Image
            src="/brand/logo-emaleli.png"
            alt="Creaciones Emaleli"
            width={34}
            height={34}
            className="rounded-[10px] bg-white"
          />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              Creaciones
            </p>
            <p className="truncate bg-gradient-to-r from-accent-600 via-primary-600 to-secondary-600 bg-clip-text font-display text-base font-bold leading-tight text-transparent">
              Emaleli
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
                      "group relative flex items-center gap-3 rounded-input px-3 py-2.5 text-sm font-semibold transition-colors",
                      isCollapsed && "justify-center px-0",
                      active
                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-card"
                        : "text-gray-500 hover:bg-primary-50 hover:text-primary-700",
                    )}
                  >
                    {active && (
                      <span
                        className="absolute -left-1 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-pill bg-accent-500 lg:block"
                        aria-hidden
                      />
                    )}
                    <Icon
                      className={clsx(
                        "size-[18px] shrink-0",
                        active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-primary-600",
                      )}
                    />
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
          <div className="mb-2 flex items-center gap-2.5 rounded-input border border-gray-100 bg-gradient-to-br from-primary-50/60 via-white to-secondary-50/60 px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-primary-600 text-xs font-bold text-white shadow-card">
              {initials || "AD"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {userName}
              </p>
              <p className="truncate text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={clsx(
              "flex w-full items-center gap-2 rounded-input bg-gradient-to-br from-coral-100/70 to-accent-100/70 px-3 py-2.5 text-sm font-medium text-coral-700 transition-colors hover:from-coral-100 hover:to-accent-100",
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

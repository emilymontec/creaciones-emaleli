"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "./admin-nav";

/**
 * Traduce segmentos de ruta (categorias, productos, [id]...) a etiquetas
 * legibles usando la config de navegación como diccionario, con un
 * fallback que capitaliza el segmento.
 */
function labelFor(segment: string, href: string): string {
  const known = ADMIN_NAV_ITEMS.find((item) => item.href === href);
  if (known) return known.label;
  if (/^[a-z0-9]{10,}$/i.test(segment)) return "Detalle";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function AdminBreadcrumb() {
  const pathname = usePathname() ?? "/admin";
  const segments = pathname.split("/").filter(Boolean); // ["admin", "categorias"]

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { href, label: labelFor(segment, href) };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/admin"
        className="flex items-center text-gray-400 hover:text-primary-600"
      >
        <Home className="size-3.5" />
      </Link>

      {crumbs.slice(1).map((crumb, i) => {
        const isLast = i === crumbs.length - 2;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-gray-300" />
            {isLast ? (
              <span className="font-semibold text-gray-800">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-400 hover:text-primary-600"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

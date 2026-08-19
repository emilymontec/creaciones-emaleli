import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  Tag,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title?: string;
  items: AdminNavItem[];
}

/**
 * Fuente única de verdad para la navegación del panel admin.
 * Se usa tanto en el Sidebar de escritorio como en el Drawer mobile
 * y en la generación del breadcrumb dinámico.
 */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/categorias", label: "Categorías", icon: Tag },
      { href: "/admin/productos", label: "Productos", icon: Package },
    ],
  },
  {
    title: "Operación",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
      { href: "/admin/produccion", label: "Producción", icon: Factory },
      { href: "/admin/pagos", label: "Pagos", icon: Wallet },
      { href: "/admin/envios", label: "Envíos", icon: Truck },
    ],
  },
  {
    title: "Negocio",
    items: [
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
      { href: "/admin/configuracion", label: "Configuración", icon: Settings },
      { href: "/admin/auditoria", label: "Auditoría", icon: ScrollText },
    ],
  },
  {
    title: "Cuenta",
    items: [{ href: "/admin/perfil", label: "Mi perfil", icon: UserCog }],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap(
  (section) => section.items,
);

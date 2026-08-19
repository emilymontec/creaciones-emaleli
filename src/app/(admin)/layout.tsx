import type { Metadata } from "next";
import type { ReactNode } from "react";

// El panel administrativo (incluido /admin/login) no debe indexarse ni
// aparecer en resultados de búsqueda — esta metadata aplica a todas las
// rutas del grupo (admin) y cada page.tsx hijo puede seguir definiendo su
// propio <title>, que Next.js combina con este robots por defecto.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

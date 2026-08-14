"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminFooter } from "./AdminFooter";
import { Drawer } from "@/src/frontend/components/ui/Drawer";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

export function AdminShell({
  userName,
  userEmail,
  logoutAction,
  children,
}: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el drawer mobile al navegar. Se ajusta el estado durante el
  // renderizado (patrón recomendado por React) en lugar de en un efecto,
  // comparando contra la última ruta vista.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileNavOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-bg-main">
      {/* Sidebar de escritorio, colapsable, siempre visible en lg+ */}
      <div className="hidden lg:block">
        <AdminSidebar
          userName={userName}
          userEmail={userEmail}
          logoutAction={logoutAction}
        />
      </div>

      {/* Sidebar en Drawer para mobile/tablet */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        side="left"
        size="sm"
        hideHeader
        noPadding
      >
        <AdminSidebar
          userName={userName}
          userEmail={userEmail}
          logoutAction={logoutAction}
          variant="mobile"
        />
      </Drawer>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar
          userName={userName}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <AdminFooter />
      </div>
    </div>
  );
}

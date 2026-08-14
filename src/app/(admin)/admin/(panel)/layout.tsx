import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/src/backend/modules/auth/lib/session";
import { logoutAction } from "@/src/backend/modules/auth/actions/logout";
import { AdminShell } from "@/src/frontend/components/layout/AdminShell";
import { ToastProvider } from "@/src/frontend/providers/ToastProvider";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <AdminShell
        userName={user.nombre}
        userEmail={user.email}
        logoutAction={logoutAction}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}

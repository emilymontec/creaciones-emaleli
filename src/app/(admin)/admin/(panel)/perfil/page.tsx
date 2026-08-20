import type { Metadata } from "next";
import { UserCog } from "lucide-react";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { PerfilPage } from "@/src/frontend/modules/auth/components/PerfilPage";

export const metadata: Metadata = {
  title: "Mi perfil | Administración",
};

export default function PerfilAdminPage() {
  return (
    <div>
      <PageHeader
        icon={UserCog}
        title="Mi perfil"
        description="Administra tus datos de acceso y la información de contacto del administrador."
      />
      <PerfilPage />
    </div>
  );
}

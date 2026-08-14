import type { Metadata } from "next";
import { PerfilPage } from "@/src/frontend/modules/auth/components/PerfilPage";

export const metadata: Metadata = {
  title: "Mi perfil | Emaleli Admin",
};

export default function PerfilAdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra tus datos de acceso y la información de contacto del administrador.
        </p>
      </div>
      <PerfilPage />
    </div>
  );
}

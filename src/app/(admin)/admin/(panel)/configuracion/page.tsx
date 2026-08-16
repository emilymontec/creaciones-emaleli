import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { ConfiguracionForms } from "@/src/frontend/modules/configuracion/components/ConfiguracionForms";
import {
  obtenerConfigEmpresa,
  obtenerConfigContacto,
} from "@/src/backend/modules/configuracion/services/configuracion.service";

export const metadata: Metadata = {
  title: "Configuración de la Tienda | Emaleli Admin",
};

export default async function ConfiguracionAdminPage() {
  const [empresa, contacto] = await Promise.all([
    obtenerConfigEmpresa(),
    obtenerConfigContacto(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Configuración de la Tienda"
        description="Administra la información general del negocio, números de WhatsApp y parámetros del sitio."
      />

      <ConfiguracionForms empresa={empresa} contacto={contacto} />
    </div>
  );
}

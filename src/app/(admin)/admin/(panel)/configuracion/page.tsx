import type { Metadata } from "next";
import { Settings } from "lucide-react";
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
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="size-6 text-primary-600" /> Configuración de la Tienda
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra la información general del negocio, números de WhatsApp y parámetros del sitio.
        </p>
      </div>

      <ConfiguracionForms empresa={empresa} contacto={contacto} />
    </div>
  );
}

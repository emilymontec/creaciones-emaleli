import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { AuditoriaPanel } from "@/src/frontend/modules/auditoria/components/AuditoriaPanel";
import { listarAuditoriaAction } from "@/src/backend/modules/auditoria/actions/manageAuditoria";

export const metadata: Metadata = {
  title: "Auditoría | Emaleli Admin",
};

export default async function AuditoriaAdminPage() {
  const registros = await listarAuditoriaAction(100);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Auditoría de Acciones"
        description="Registro de acciones administrativas sensibles: cambios de configuración, eliminaciones y cambios de contraseña. Los cambios de estado, pagos y producción por pedido tienen su propio historial en el detalle de cada pedido."
      />
      <AuditoriaPanel registros={registros} />
    </div>
  );
}

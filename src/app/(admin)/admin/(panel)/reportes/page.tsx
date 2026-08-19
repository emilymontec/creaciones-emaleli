import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/src/frontend/components/shared/PageHeader";
import { ReportesDashboard } from "@/src/frontend/modules/reportes/components/ReportesDashboard";
import { obtenerReportes } from "@/src/backend/modules/reportes/services/reportes.service";
import { getCategories } from "@/src/backend/modules/categorias/services/category.service";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";

export const metadata: Metadata = {
  title: "Reportes y Analíticas | Emaleli Admin",
};

export default async function ReportesAdminPage() {
  await requireAdmin(PERMISOS.REPORTES_VER);

  const [data, categorias] = await Promise.all([
    obtenerReportes({}),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Reportes de Negocio"
        description="Ventas, productos, pedidos y clientes — con filtros por fecha y categoría, y exportación a CSV."
      />

      <ReportesDashboard
        initialData={data}
        categorias={categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
      />
    </div>
  );
}

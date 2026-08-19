"use client";

import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { Card } from "@/src/frontend/components/ui/Card";
import { Badge } from "@/src/frontend/components/ui/Badge";

type RegistroAuditoria = {
  id: string;
  usuarioNombre: string | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  createdAt: Date;
};

function accionVariante(accion: string) {
  if (accion.includes("ELIMINAD")) return "error" as const;
  if (accion.includes("CAMBIADA") || accion.includes("ACTUALIZAD"))
    return "warning" as const;
  return "neutral" as const;
}

export function AuditoriaPanel({
  registros,
}: {
  registros: RegistroAuditoria[];
}) {
  const columns: TableColumn<RegistroAuditoria>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      sortValue: (r) => new Date(r.createdAt).getTime(),
      render: (r) => (
        <span className="text-xs text-gray-500">
          {new Date(r.createdAt).toLocaleString("es-CO", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      key: "usuario",
      header: "Usuario",
      render: (r) => (
        <span className="font-medium text-gray-800">
          {r.usuarioNombre || "Sistema"}
        </span>
      ),
    },
    {
      key: "accion",
      header: "Acción",
      render: (r) => (
        <Badge variant={accionVariante(r.accion)}>{r.accion}</Badge>
      ),
    },
    {
      key: "entidad",
      header: "Entidad",
      render: (r) => (
        <span className="text-xs text-gray-600">
          {r.entidad}
          {r.entidadId && (
            <span className="ml-1 font-mono text-gray-400">
              #{r.entidadId.slice(0, 8)}
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <Card className="p-0">
      <Table
        columns={columns}
        data={registros}
        rowKey={(r) => r.id}
        emptyTitle="Sin actividad registrada"
        emptyDescription="Las acciones administrativas sensibles (configuración, eliminaciones, cambios de contraseña) aparecerán aquí."
      />
    </Card>
  );
}

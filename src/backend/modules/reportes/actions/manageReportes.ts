"use server";

import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";
import {
  ReportesFiltrosSchema,
  type ReportesFiltros,
} from "../schemas/reportes.schema";
import { obtenerReportes } from "../services/reportes.service";

export type ReportesActionState =
  | { success: true; data: Awaited<ReturnType<typeof obtenerReportes>> }
  | { success: false; error: string };

export async function obtenerReportesAction(
  filtrosInput: ReportesFiltros,
): Promise<ReportesActionState> {
  await requireAdmin(PERMISOS.REPORTES_VER);

  const parsed = ReportesFiltrosSchema.safeParse(filtrosInput);
  if (!parsed.success) {
    return { success: false, error: "Filtros de reporte inválidos." };
  }

  try {
    const data = await obtenerReportes(parsed.data);
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "No se pudieron cargar los reportes. Intenta de nuevo.",
    };
  }
}

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function seccionCsv(
  titulo: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const lineas = [
    titulo,
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  return lineas.join("\n");
}

export async function exportarReportesCsvAction(
  filtrosInput: ReportesFiltros,
): Promise<{ success: true; csv: string } | { success: false; error: string }> {
  await requireAdmin(PERMISOS.REPORTES_VER);

  const parsed = ReportesFiltrosSchema.safeParse(filtrosInput);
  if (!parsed.success) {
    return { success: false, error: "Filtros de reporte inválidos." };
  }

  try {
    const data = await obtenerReportes(parsed.data);

    const secciones = [
      seccionCsv(
        `Ventas por ${data.agrupacion} (${data.rango.desde} a ${data.rango.hasta})`,
        ["Periodo", "Total", "Pedidos"],
        data.ventas.map((v) => [v.periodo, v.total, v.pedidos]),
      ),
      seccionCsv(
        "Productos más vendidos",
        ["Producto", "Cantidad", "Total"],
        data.productosMasVendidos.map((p) => [
          p.nombreProducto,
          p.cantidad,
          p.total,
        ]),
      ),
      seccionCsv(
        "Productos menos vendidos",
        ["Producto", "Cantidad", "Total"],
        data.productosMenosVendidos.map((p) => [
          p.nombreProducto,
          p.cantidad,
          p.total,
        ]),
      ),
      seccionCsv(
        "Pedidos por estado",
        ["Estado", "Cantidad"],
        data.pedidosEstado.map((p) => [p.estado, p.cantidad]),
      ),
      seccionCsv(
        "Pedidos por ciudad",
        ["Ciudad", "Cantidad"],
        data.pedidosCiudad.map((p) => [
          p.ciudad ?? "Sin especificar",
          p.cantidad,
        ]),
      ),
      seccionCsv(
        "Tiempo promedio por etapa (horas)",
        ["Estado", "Horas promedio", "Muestras"],
        data.tiempoPorEtapa.map((t) => [
          t.estado,
          t.horasPromedio.toFixed(1),
          t.muestras,
        ]),
      ),
      seccionCsv(
        "Clientes frecuentes",
        ["Cliente", "WhatsApp", "Ciudad", "Pedidos", "Total gastado"],
        data.clientesFrecuentes.map((c) => [
          c.cliente?.nombre ?? "—",
          c.cliente?.whatsapp ?? "—",
          c.cliente?.ciudad ?? "—",
          c.pedidos,
          c.totalGastado,
        ]),
      ),
      seccionCsv(
        `Clientes nuevos en el período (total: ${data.clientesNuevos.total})`,
        ["Cliente", "WhatsApp", "Ciudad", "Fecha de registro"],
        data.clientesNuevos.ultimos.map((c) => [
          c.nombre,
          c.whatsapp,
          c.ciudad ?? "—",
          c.createdAt.toISOString(),
        ]),
      ),
    ];

    return { success: true, csv: secciones.join("\n\n") };
  } catch {
    return {
      success: false,
      error: "No se pudo generar la exportación. Intenta de nuevo.",
    };
  }
}

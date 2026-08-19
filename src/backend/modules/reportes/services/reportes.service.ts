import * as repository from "../repositories/reportes.repository";
import type { ReportesFiltros, Agrupacion } from "../schemas/reportes.schema";

const DIA_MS = 86_400_000;

function parseRango(filtros: ReportesFiltros) {
  const hasta = filtros.fechaFin ? new Date(filtros.fechaFin) : new Date();
  // Por defecto se muestran los últimos 30 días — un rango sin filtro
  // explícito sería una consulta de todo el historial en cada carga.
  const desde = filtros.fechaInicio
    ? new Date(filtros.fechaInicio)
    : new Date(hasta.getTime() - 30 * DIA_MS);

  // Incluye el día completo de "hasta".
  hasta.setHours(23, 59, 59, 999);

  return { desde, hasta };
}

function elegirAgrupacion(desde: Date, hasta: Date): Agrupacion {
  const dias = (hasta.getTime() - desde.getTime()) / DIA_MS;
  if (dias <= 31) return "dia";
  if (dias <= 366) return "mes";
  return "anio";
}

export async function obtenerReportes(filtros: ReportesFiltros) {
  const rango = parseRango(filtros);
  const agrupacion = elegirAgrupacion(rango.desde, rango.hasta);

  const [
    ventas,
    productosMasVendidos,
    productosMenosVendidos,
    pedidosEstado,
    pedidosCiudad,
    tiempoPorEtapa,
    clientesFrecuentes,
    clientesNuevos,
  ] = await Promise.all([
    repository.ventasPorPeriodo(agrupacion, rango),
    repository.productosPorVentas(rango, filtros.categoriaId, "desc", 10),
    repository.productosPorVentas(rango, filtros.categoriaId, "asc", 10),
    repository.pedidosPorEstado(rango),
    repository.pedidosPorCiudad(rango),
    repository.tiempoPromedioPorEtapa(rango),
    repository.clientesFrecuentes(rango),
    repository.clientesNuevos(rango),
  ]);

  const ventasTotales = ventas.reduce((acc, v) => acc + v.total, 0);
  const pedidosTotales = ventas.reduce((acc, v) => acc + v.pedidos, 0);

  return {
    rango: {
      desde: rango.desde.toISOString(),
      hasta: rango.hasta.toISOString(),
    },
    agrupacion,
    resumen: {
      ventasTotales,
      pedidosTotales,
      ticketPromedio: pedidosTotales > 0 ? ventasTotales / pedidosTotales : 0,
    },
    ventas,
    productosMasVendidos,
    productosMenosVendidos,
    pedidosEstado,
    pedidosCiudad,
    tiempoPorEtapa,
    clientesFrecuentes,
    clientesNuevos,
  };
}

export type ReportesData = Awaited<ReturnType<typeof obtenerReportes>>;

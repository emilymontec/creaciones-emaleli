import { z } from "zod";

export const ReportesFiltrosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  categoriaId: z.string().optional(),
});

export type ReportesFiltros = z.infer<typeof ReportesFiltrosSchema>;

export const AGRUPACIONES = ["dia", "mes", "anio"] as const;
export type Agrupacion = (typeof AGRUPACIONES)[number];

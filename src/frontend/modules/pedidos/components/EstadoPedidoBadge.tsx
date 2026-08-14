import {
  ESTADO_PEDIDO_LABEL,
  ESTADO_PEDIDO_COLOR,
  ESTADOS_PEDIDO_ORDEN,
} from "@/src/backend/modules/pedidos/schemas/pedido-admin.schema";
import type { EstadoPedido } from "@/generated/prisma/client";
import clsx from "clsx";

export function EstadoPedidoBadge({
  estado,
  size = "sm",
}: {
  estado: EstadoPedido | string;
  size?: "sm" | "md";
}) {
  const label =
    ESTADO_PEDIDO_LABEL[estado as EstadoPedido] ?? (estado as string);
  const color =
    ESTADO_PEDIDO_COLOR[estado as EstadoPedido] ??
    "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 font-semibold",
        size === "sm" ? "py-0.5 text-[11px]" : "py-1 text-xs",
        color,
      )}
    >
      <span
        className={clsx(
          "size-1.5 rounded-full",
          estado === "NUEVO" && "bg-gray-500",
          estado === "EN_REVISION" && "bg-blue-500",
          estado === "ESPERANDO_CLIENTE" && "bg-amber-500",
          estado === "DISENO_APROBADO" && "bg-violet-500",
          estado === "EN_PRODUCCION" && "bg-indigo-500",
          estado === "EMPACADO" && "bg-purple-500",
          estado === "ENVIADO" && "bg-sky-500",
          estado === "ENTREGADO" && "bg-emerald-500",
          estado === "CANCELADO" && "bg-red-500",
        )}
      />
      {label}
    </span>
  );
}

export function estadoOptions(includeTodos = true) {
  const opts: { value: string; label: string }[] = [];
  if (includeTodos) opts.push({ value: "", label: "Todos los estados" });
  for (const e of ESTADOS_PEDIDO_ORDEN) {
    opts.push({ value: e, label: ESTADO_PEDIDO_LABEL[e] });
  }
  return opts;
}

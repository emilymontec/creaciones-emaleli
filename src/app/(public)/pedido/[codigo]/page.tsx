import { redirect } from "next/navigation";
import { obtenerPedidoPorCodigo } from "@/src/backend/modules/pedidos/services/pedido.service";

export default async function PedidoCodigoRedirectPage({
  params,
}: {
  params: { codigo: string };
}) {
  const pedido = await obtenerPedidoPorCodigo(params.codigo.toUpperCase());
  if (pedido?.tokenSeguimiento) {
    redirect(`/seguimiento/${pedido.tokenSeguimiento}`);
  }
  redirect("/");
}

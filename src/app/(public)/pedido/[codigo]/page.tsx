import { redirect } from "next/navigation";
import { obtenerPedidoPorCodigo } from "@/src/backend/modules/pedidos/services/pedido.service";

export default async function PedidoCodigoRedirectPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const pedido = await obtenerPedidoPorCodigo(codigo.toUpperCase());
  if (pedido?.tokenSeguimiento) {
    redirect(`/seguimiento/${pedido.tokenSeguimiento}`);
  }
  redirect("/");
}

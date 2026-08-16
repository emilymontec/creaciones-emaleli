import { NextResponse } from "next/server";
import { getSessionUser } from "@/src/backend/modules/auth/lib/session";
import { obtenerProduccionCompletaAction } from "@/src/backend/modules/pedidos/actions/manageProduccion";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "No autorizado." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const res = await obtenerProduccionCompletaAction(id);
  return NextResponse.json(res, {
    status: res.success ? 200 : 400,
  });
}

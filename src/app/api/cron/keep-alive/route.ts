import { NextResponse } from "next/server";
import { prisma } from "@/backend/shared/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Endpoint para Vercel Cron que mantiene activa la base de datos de Supabase.
 * Ejecuta una consulta SQL ligera (SELECT 1) y un ping a la API REST.
 */
export async function GET(request: Request) {
  // Validación de seguridad opcional si se configura CRON_SECRET en Vercel
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    // 1. Ping directo a la base de datos mediante Prisma (SELECT 1)
    await prisma.$queryRaw`SELECT 1 AS alive;`;

    // 2. Ping complementario a la API REST de Supabase (si está configurada la URL)
    let restStatus: number | null = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && apiKey) {
      try {
        const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
          method: "GET",
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
        });
        restStatus = res.status;
      } catch {
        // Si falla el ping REST no bloqueamos, el SQL ya fue exitoso
      }
    }

    const durationMs = Date.now() - start;

    return NextResponse.json({
      success: true,
      durationMs,
      restStatus,
      timestamp: new Date().toISOString(),
      message: "Supabase database kept alive successfully via Vercel Cron",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}

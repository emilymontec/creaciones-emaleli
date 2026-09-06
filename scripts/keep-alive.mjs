import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

/**
 * Carga de variables de entorno sin librerías pesadas.
 * Prioriza .env.local y luego .env usando la API nativa de Node.js.
 */
function loadEnv() {
  const files = [".env.local", ".env"];
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      if (typeof process.loadEnvFile === "function") {
        try {
          process.loadEnvFile(fullPath);
        } catch {
          // Ignorar si hay variables ya establecidas o duplicadas
        }
      } else {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (process.env[key] === undefined) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

/**
 * Ping directo a PostgreSQL (Supabase Pooler o Direct Connection).
 * Ejecuta SELECT 1 y cierra la conexión de inmediato para liberar recursos.
 */
async function pingPostgres() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

  const now = new Date().toISOString();

  if (!connectionString) {
    return {
      source: "PostgreSQL",
      success: false,
      latencyMs: 0,
      timestamp: now,
      message: "No se encontró DATABASE_URL ni DIRECT_URL",
    };
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 8000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const start = Date.now();
  try {
    await client.connect();
    const res = await client.query("SELECT 1 AS alive, NOW() AS server_time;");
    const latencyMs = Date.now() - start;
    await client.end();

    return {
      source: "PostgreSQL",
      success: true,
      latencyMs,
      timestamp: now,
      message: `OK (hora servidor: ${res.rows[0]?.server_time?.toISOString?.() ?? "activo"})`,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    try {
      await client.end();
    } catch {
      // Ignorar error al cerrar si no se conectó
    }
    return {
      source: "PostgreSQL",
      success: false,
      latencyMs,
      timestamp: now,
      message: error.message,
    };
  }
}

/**
 * Ping HTTP ultraligero a la API REST de Supabase.
 * Registra tráfico activo en el proyecto de Supabase consumiendo < 5MB de RAM.
 */
async function pingSupabaseRest() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const now = new Date().toISOString();

  if (!url || !key) {
    return {
      source: "Supabase REST",
      success: false,
      latencyMs: 0,
      timestamp: now,
      message: "No se encontró NEXT_PUBLIC_SUPABASE_URL ni API key",
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const targetUrl = `${url.replace(/\/$/, "")}/rest/v1/`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;
    return {
      source: "Supabase REST",
      success: response.ok,
      latencyMs,
      timestamp: now,
      message: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      source: "Supabase REST",
      success: false,
      latencyMs,
      timestamp: now,
      message: error.message,
    };
  }
}

/**
 * Ejecuta una verificación y reporta el estado
 */
async function runKeepAlive() {
  const time = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  console.log(`\n========================================`);
  console.log(`[Supabase Keep-Alive] Ping: ${time}`);
  console.log(`========================================`);

  const [pgResult, restResult] = await Promise.all([
    pingPostgres(),
    pingSupabaseRest(),
  ]);

  if (pgResult.success) {
    console.log(
      `✔ [PostgreSQL SQL]:    Activo (${pgResult.latencyMs} ms) -> ${pgResult.message}`,
    );
  } else {
    console.warn(
      `✖ [PostgreSQL SQL]:    Error (${pgResult.latencyMs} ms) -> ${pgResult.message}`,
    );
  }

  if (restResult.success) {
    console.log(
      `✔ [Supabase REST API]: Activo (${restResult.latencyMs} ms) -> ${restResult.message}`,
    );
  } else {
    console.warn(
      `✖ [Supabase REST API]: Error (${restResult.latencyMs} ms) -> ${restResult.message}`,
    );
  }

  const isAlive = pgResult.success || restResult.success;
  if (isAlive) {
    console.log(
      `✅ Base de datos / Proyecto Supabase mantenido ACTIVO exitosamente.`,
    );
  } else {
    console.error(
      `❌ Ambos métodos de ping fallaron. Revisa las credenciales o el estado de Supabase.`,
    );
  }

  return isAlive;
}

// Procesar argumentos de terminal
const args = process.argv.slice(2);
const isLoop =
  args.includes("--loop") || args.includes("--daemon") || args.includes("-d");

const intervalIdx = args.findIndex((a) => a === "--interval" || a === "-i");
const intervalHoursParsed =
  intervalIdx !== -1 && args[intervalIdx + 1]
    ? parseFloat(args[intervalIdx + 1])
    : undefined;

const intervalHours =
  intervalHoursParsed && !isNaN(intervalHoursParsed)
    ? intervalHoursParsed
    : parseFloat(process.env.KEEP_ALIVE_INTERVAL_HOURS || "48");

async function main() {
  if (!isLoop) {
    const success = await runKeepAlive();
    process.exit(success ? 0 : 1);
  }

  console.log(
    `Iniciando en modo daemon continuo (cada ${intervalHours} horas).`,
  );
  console.log(`Presiona Ctrl + C para detener el proceso.`);

  // Primer ping inmediato
  await runKeepAlive();

  const intervalMs = Math.max(0.1, intervalHours) * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      await runKeepAlive();
    } catch (err) {
      console.error("[Keep-Alive Error inesperado]:", err);
    }
  }, intervalMs);
}

main().catch((err) => {
  console.error("Error fatal en keep-alive:", err);
  process.exit(1);
});

/**
 * Rate limiter en memoria (sliding window simplificado) para proteger
 * endpoints públicos sensibles: login (fuerza bruta) y checkout (spam de
 * pedidos).
 *
 * LIMITACIÓN CONOCIDA: al ser en memoria del proceso, en un despliegue
 * serverless con múltiples instancias (p. ej. Vercel con varias funciones
 * concurrentes) el límite se aplica por instancia, no de forma global.
 * Es una mitigación razonable para el volumen actual del proyecto, pero
 * para producción a mayor escala se recomienda migrar a un store
 * compartido (p. ej. Upstash Redis / Vercel KV) manteniendo la misma
 * interfaz `checkRateLimit`.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limpieza periódica para evitar crecimiento indefinido del Map.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key Identificador único del sujeto limitado, p. ej. `login:<ip>:<usuario>`.
 * @param limit Número máximo de intentos permitidos dentro de la ventana.
 * @param windowMs Duración de la ventana en milisegundos.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

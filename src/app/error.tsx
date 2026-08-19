"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/src/shared/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Se registra en el logger del cliente para diagnóstico; nunca se
    // muestra el stack trace ni detalles internos al usuario.
    logger.error("Error no controlado en la tienda pública", {
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-main px-6 text-center">
      <p className="font-display text-5xl font-bold text-coral-500">:(</p>
      <h1 className="text-xl font-semibold text-gray-900">Algo salió mal</h1>
      <p className="max-w-md text-sm text-gray-600">
        Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al
        inicio; si el problema continúa, contáctanos por WhatsApp.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-button bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-button bg-white px-5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}

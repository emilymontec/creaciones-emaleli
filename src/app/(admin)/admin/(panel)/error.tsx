"use client";

import { useEffect } from "react";
import { logger } from "@/src/shared/lib/logger";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Error no controlado en el panel admin", {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-white p-10 text-center shadow-sm">
      <p className="font-display text-4xl font-bold text-coral-500">:(</p>
      <h1 className="text-lg font-semibold text-gray-900">
        Ocurrió un error al cargar esta sección
      </h1>
      <p className="max-w-md text-sm text-gray-600">
        Puedes intentar de nuevo. Si el problema persiste, revisa la consola del
        servidor o contacta al equipo técnico.
      </p>
      <button
        onClick={reset}
        className="mt-2 inline-flex h-10 items-center justify-center rounded-button bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-main px-6 text-center">
      <p className="font-display text-6xl font-bold text-primary-500">404</p>
      <h1 className="text-xl font-semibold text-gray-900">
        No encontramos esta página
      </h1>
      <p className="max-w-md text-sm text-gray-600">
        El enlace puede estar mal escrito o la página ya no existe. Vuelve al
        inicio para seguir explorando el catálogo.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center justify-center rounded-button bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

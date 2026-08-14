import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/src/frontend/modules/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Emaleli",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-main px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo-emaleli.png"
            alt="Creaciones Emaleli"
            width={56}
            height={56}
            className="mb-3 rounded-2xl"
          />
          <p className="font-display text-display-sm font-bold text-gray-900">
            Creaciones Emaleli
          </p>
          <p className="mt-1 text-sm text-gray-500">Panel de administración</p>
        </div>

        <div className="rounded-card border border-gray-100 bg-white p-6 shadow-card">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          Acceso exclusivo del equipo Emaleli.
        </p>
      </div>
    </div>
  );
}

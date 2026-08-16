import type { Metadata } from "next";
import Image from "next/image";
import { Lock } from "lucide-react";
import { LoginForm } from "@/src/frontend/modules/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Emaleli",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-main px-4">
      {/* Decoración de marca */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-gradient-to-br from-accent-300/40 to-coral-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-gradient-to-br from-secondary-300/40 to-primary-300/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-1 w-full -translate-x-1/2 bg-marquee-gradient"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-white p-2 shadow-card">
            <Image
              src="/brand/logo-emaleli.png"
              alt="Creaciones Emaleli"
              width={52}
              height={52}
              className="rounded-xl"
            />
          </div>
          <p className="font-display text-display-sm font-bold text-gray-900">
            Creaciones Emaleli
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500">
            <Lock className="size-3.5" /> Panel de administración
          </p>
        </div>

        <div className="relative overflow-hidden rounded-modal border border-gray-100 bg-white p-6 shadow-elevated">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-marquee-gradient" aria-hidden />
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          Acceso exclusivo del equipo Emaleli.
        </p>
      </div>
    </div>
  );
}

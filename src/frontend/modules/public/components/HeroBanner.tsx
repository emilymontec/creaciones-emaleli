import Link from "next/link";
import { ArrowRight, ShieldCheck, Gift, Sparkles, Zap } from "lucide-react";
import type { BannerConfigInput } from "@/src/backend/modules/configuracion/schemas/configuracion.schema";

export function HeroBanner({ banner }: { banner?: BannerConfigInput }) {
  const usarOverride = Boolean(banner?.activo);
  const titulo = banner?.titulo?.trim();
  const subtitulo = banner?.subtitulo?.trim();
  const textoBoton = banner?.textoBoton?.trim() || "Ver catálogo completo";
  const linkBoton = banner?.linkBoton?.trim() || "/catalogo";

  return (
    <section
      className="relative overflow-hidden rounded-modal bg-gradient-to-r from-accent-600 via-primary-600 to-secondary-600 p-6 text-white shadow-elevated sm:p-10"
      style={
        usarOverride && banner?.imagenUrl
          ? {
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url(${banner.imagenUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Fondos decorativos */}
      {!(usarOverride && banner?.imagenUrl) && (
        <>
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 size-64 rounded-full bg-white/5 blur-xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Lado Izquierdo */}
        <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="size-3.5" />
              Personalización Premium
            </span>
          </div>

          {usarOverride && titulo ? (
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-display-md lg:text-display-lg text-white">
              {titulo}
            </h1>
          ) : (
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-display-md lg:text-display-lg text-white">
              Productos personalizados
              <br />
              <span className="text-yellow-200 drop-shadow">
                hechos especialmente para ti
              </span>
            </h1>
          )}

          <p className="max-w-xl text-sm text-white/85 sm:text-base">
            {usarOverride && subtitulo
              ? subtitulo
              : "Personaliza camisetas, tazas, sacos, termos y llaveros con tus fotos, logos o frases favoritas. Producción con acabado premium y envíos a todo el país."}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link
              href={linkBoton}
              className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-3.5 text-sm font-extrabold text-accent-700 shadow-card transition-all hover:bg-gray-50 hover:scale-105 active:scale-95"
            >
              <Zap className="size-4 text-coral-500" />
              {textoBoton}
              <ArrowRight className="size-4" />
            </Link>

            {!usarOverride && (
              <Link
                href="/catalogo?categoria=camisetas"
                className="inline-flex items-center gap-2 rounded-pill border-2 border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                Camisetas Personalizadas
              </Link>
            )}
          </div>

          {/* Sellos de confianza */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-semibold text-white/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-300" />
              Pago 100% Seguro
            </span>
            <span className="flex items-center gap-1.5">
              <Gift className="size-4 text-pink-200" />
              Empaque de Regalo incluido
            </span>
          </div>
        </div>

        {/* Lado Derecho — CTA secundario */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-sm rounded-card bg-white/15 p-5 backdrop-blur border border-white/25 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2 border-b border-white/20 pb-3">
              <Zap className="size-5 text-yellow-300" />
              <span className="text-sm font-extrabold text-yellow-200">
                Oferta de Temporada
              </span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              Hasta un{" "}
              <span className="font-extrabold text-yellow-200 text-sm">
                40% de descuento
              </span>{" "}
              en productos seleccionados del catálogo.
            </p>
            <Link
              href="/catalogo?orden=precio_asc"
              className="block w-full rounded-pill bg-white py-2.5 text-center text-xs font-extrabold text-accent-700 shadow transition-all hover:bg-gray-50 hover:scale-105"
            >
              Ver productos con descuento
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import {
  Headset,
  RotateCcw,
  ShieldCheck,
  Truck,
  Heart,
  MapPin,
  Clock,
  Camera,
  Users,
  Music2,
} from "lucide-react";
import type {
  EmpresaConfigInput,
  ContactoConfigInput,
} from "@/src/backend/modules/configuracion/schemas/configuracion.schema";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Pago 100% Seguro",
    description:
      "Coordinamos el pago directamente contigo por Nequi, Bancolombia o WhatsApp",
  },
  {
    icon: RotateCcw,
    title: "Garantía de Satisfacción",
    description: "Revisamos la muestra digital de tu diseño antes de imprimir",
  },
  {
    icon: Headset,
    title: "Asesoría en Vivo",
    description: "Atención personalizada por WhatsApp durante todo el proceso",
  },
  {
    icon: Truck,
    title: "Envíos a todo Colombia",
    description: "Despachamos tu pedido con empaque protector hasta tu puerta",
  },
];

export function PublicFooter({
  empresa,
  contacto,
}: {
  empresa: EmpresaConfigInput;
  contacto: ContactoConfigInput;
}) {
  const nombreEmpresa = empresa.nombre || "Creaciones Emaleli";
  const redes = [
    { href: contacto.instagram, label: "Instagram", Icon: Camera },
    { href: contacto.facebook, label: "Facebook", Icon: Users },
    { href: contacto.tiktok, label: "TikTok", Icon: Music2 },
  ].filter((r) => r.href);

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Sellos de confianza */}
      <div className="bg-gray-50/80 border-b border-gray-100">
        <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-card bg-white p-4 shadow-card border border-gray-100"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <Icon className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{title}</h4>
                <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo, contacto y links */}
      <div className="mx-auto flex w-full max-w-page flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <Image
          src={empresa.logoUrl || "/brand/logo-emaleli.png"}
          alt={nombreEmpresa}
          width={52}
          height={52}
          className="rounded-xl object-contain"
        />

        <span className="font-display text-xl font-extrabold tracking-tight text-primary-700">
          {nombreEmpresa}
        </span>

        <p className="max-w-md text-xs text-gray-500">
          Productos estampados y regalos personalizados de alta calidad. Envíos
          a todo Colombia.
        </p>

        {/* Información de contacto visible (dirección/horario) */}
        {(empresa.direccion || empresa.horario) && (
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
            {empresa.direccion && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-accent-500" />
                {empresa.direccion}
              </span>
            )}
            {empresa.horario && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-accent-500" />
                {empresa.horario}
              </span>
            )}
          </div>
        )}

        {redes.length > 0 && (
          <div className="flex items-center gap-3">
            {redes.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-accent-100 hover:text-accent-700"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-gray-600">
          <Link href="/" className="hover:text-accent-600">
            Inicio
          </Link>
          <Link href="/catalogo" className="hover:text-accent-600">
            Catálogo
          </Link>
          <Link
            href="/catalogo?categoria=camisetas"
            className="hover:text-accent-600"
          >
            Camisetas
          </Link>
          <Link
            href="/catalogo?categoria=tazas"
            className="hover:text-accent-600"
          >
            Tazas
          </Link>
          <Link href="/carrito" className="hover:text-accent-600">
            Mi Carrito
          </Link>
        </div>

        <div className="mt-4 border-t border-gray-100 w-full pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          <p>
            © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos
            reservados.
          </p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="size-3 text-coral-500 fill-coral-500" />{" "}
            en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}

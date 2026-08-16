"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Truck,
  MessageCircle,
  ChevronRight,
  Tag,
  Shirt,
  Coffee,
  Wind,
  Cylinder,
  KeyRound,
  BookOpen,
  Percent,
  Lock,
} from "lucide-react";
import { useCart } from "@/src/frontend/cart/CartContext";
import { CartDrawer } from "@/src/frontend/cart/CartDrawer";

const CATEGORIES_NAV = [
  { label: "Descuentos", href: "/catalogo?orden=precio_asc", Icon: Percent },
  { label: "Camisetas", href: "/catalogo?categoria=camisetas", Icon: Shirt },
  { label: "Tazas & Mugs", href: "/catalogo?categoria=tazas", Icon: Coffee },
  { label: "Hoodies & Sacos", href: "/catalogo?categoria=hoodies", Icon: Wind },
  { label: "Termos", href: "/catalogo?categoria=termos", Icon: Cylinder },
  { label: "Accesorios", href: "/catalogo?categoria=accesorios", Icon: KeyRound },
  { label: "Papelería", href: "/catalogo?categoria=papelera", Icon: BookOpen },
];

const QUICK_TAGS = [
  { label: "Camisetas", slug: "camisetas" },
  { label: "Tazas Mágicas", slug: "tazas" },
  { label: "Hoodies", slug: "hoodies" },
  { label: "Termos 750ml", slug: "termos" },
];

export function PublicHeader() {
  const { totalItems, openDrawer } = useCart();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/catalogo");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
      {/* 1. Barra Promocional Superior */}
      <div className="bg-marquee-gradient px-4 py-1.5 text-center text-xs font-bold text-white">
        <div className="mx-auto flex max-w-page items-center justify-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/20 px-2 py-0.5 backdrop-blur">
            <Truck className="size-3" />
            Envíos Nacionales
          </span>
          <span className="hidden sm:inline">
            Descuentos de hasta 40% en productos seleccionados
          </span>
          <span className="sm:hidden">Hasta 40% de descuento</span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/20 px-2 py-0.5 backdrop-blur">
            <Tag className="size-3" />
            Envío Gratis disponible
          </span>
        </div>
      </div>

      {/* 2. Cabecera Principal */}
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo de Empresa — reemplaza /public/brand/logo-emaleli.png con tu logo real */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center rounded-xl overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src="/brand/logo-emaleli.png"
              alt="Creaciones Emaleli"
              width={44}
              height={44}
              className="rounded-lg object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight text-primary-700">
              Creaciones Emaleli
            </span>
            <span className="text-[10px] font-semibold text-secondary-600 uppercase tracking-widest">
              Detalles Personalizados
            </span>
          </div>
        </Link>

        {/* Buscador Central */}
        <div className="hidden flex-1 max-w-xl md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos personalizados (camisetas, tazas, sacos)..."
              className="w-full rounded-pill border-2 border-primary-200 bg-gray-50 py-2 pl-4 pr-12 text-sm text-gray-900 shadow-sm transition-all focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-200"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-1 flex size-9 items-center justify-center rounded-full bg-accent-500 text-white shadow transition-all hover:bg-accent-600 hover:scale-105"
            >
              <Search className="size-4" />
            </button>
          </form>
          {/* Etiquetas Rápidas */}
          <div className="mt-1.5 flex items-center gap-2 overflow-x-auto text-[11px] text-gray-500">
            <span className="font-semibold text-gray-400">Tendencias:</span>
            {QUICK_TAGS.map((tag) => (
              <Link
                key={tag.slug}
                href={`/catalogo?categoria=${tag.slug}`}
                className="rounded-pill bg-gray-100 px-2 py-0.5 font-medium text-gray-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Botones Derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 bg-primary-50 px-3 py-2 rounded-pill transition-colors border border-primary-200"
          >
            <Lock className="size-4" />
            <span>Panel Admin</span>
          </Link>

          <a
            href="https://wa.me/573000000000?text=Hola,%20quisiera%20asesoría%20para%20un%20producto%20personalizado"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-pill transition-colors border border-emerald-200"
          >
            <MessageCircle className="size-4" />
            <span>Asesoría WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={openDrawer}
            className="relative flex items-center gap-2 rounded-pill bg-gradient-to-r from-accent-500 to-coral-500 px-3 py-2 sm:px-4 text-sm font-bold text-white shadow-card transition-all hover:shadow-card-hover hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-extrabold text-white ring-2 ring-white animate-badge-bounce">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrito</span>
          </button>
        </div>
      </div>

      {/* Buscador móvil */}
      <div className="px-4 pb-2 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar camisetas, tazas..."
            className="w-full rounded-pill border border-gray-300 bg-gray-50 py-1.5 pl-3 pr-10 text-xs text-gray-900 focus:border-accent-500 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-1 flex size-7 items-center justify-center rounded-full bg-accent-500 text-white"
          >
            <Search className="size-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Sub-barra de Categorías */}
      <nav className="border-t border-gray-100 bg-gray-50/80 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center gap-2 overflow-x-auto text-xs font-semibold sm:px-6">
          {CATEGORIES_NAV.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex shrink-0 items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-gray-700 shadow-sm border border-gray-200/60 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700"
            >
              <cat.Icon className="size-3.5 text-gray-500" />
              <span>{cat.label}</span>
            </Link>
          ))}
          <Link
            href="/catalogo"
            className="flex shrink-0 items-center gap-1 rounded-pill bg-primary-500 px-3 py-1.5 text-white transition-colors hover:bg-primary-600 ml-auto"
          >
            <span>Ver Todo</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </nav>

      <CartDrawer />
    </header>
  );
}

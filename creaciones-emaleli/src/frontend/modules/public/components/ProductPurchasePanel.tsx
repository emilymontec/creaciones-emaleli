"use client";

import { useMemo, useState } from "react";
import { Clock, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/src/frontend/components/ui/Button";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import { useCart } from "@/src/frontend/cart/CartContext";
import { calcularPrecioUnitario, formatCOP } from "@/src/shared/lib/pricing";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import {
  PersonalizationFieldInput,
  type PersonalizationFieldPublicDTO,
  type PersonalizationResult,
} from "./PersonalizationFieldInput";

export interface OpcionPublicDTO {
  id: string;
  nombre: string;
  tipo: string;
  imagen: string | null;
  precioExtra: number;
}

export interface CombinacionPublicDTO {
  id: string;
  precio: number | null;
  stock: number | null;
  opcionIds: string[];
}

export interface ProductoDetailDTO {
  id: string;
  nombre: string;
  slug: string;
  descripcionLarga: string | null;
  precioBase: number;
  precioDescuento: number | null;
  tiempoProduccion: number | null;
  estado: string;
  imagenes: GalleryImage[];
  variantes: OpcionPublicDTO[];
  combinaciones: CombinacionPublicDTO[];
  personalizaciones: PersonalizationFieldPublicDTO[];
}

export function ProductPurchasePanel({
  producto,
}: {
  producto: ProductoDetailDTO;
}) {
  const { addItem, openDrawer } = useCart();
  const { toast } = useToast();

  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    producto.imagenes[0]?.url ?? null,
  );
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [personalizaciones, setPersonalizaciones] = useState<
    Record<string, PersonalizationResult>
  >({});
  const [cantidad, setCantidad] = useState(1);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const grupos = useMemo(() => {
    const map = new Map<string, OpcionPublicDTO[]>();
    for (const o of producto.variantes) {
      if (!map.has(o.tipo)) map.set(o.tipo, []);
      map.get(o.tipo)!.push(o);
    }
    return map;
  }, [producto.variantes]);

  const opcionesSeleccionadas = useMemo(
    () =>
      Object.values(seleccion)
        .map((id) => producto.variantes.find((o) => o.id === id))
        .filter((o): o is OpcionPublicDTO => Boolean(o)),
    [seleccion, producto.variantes],
  );

  const combinacionSeleccionada = useMemo(() => {
    if (producto.combinaciones.length === 0) return null;
    if (opcionesSeleccionadas.length !== grupos.size) return null;

    const idsSeleccionados = new Set(opcionesSeleccionadas.map((o) => o.id));
    return (
      producto.combinaciones.find((c) => {
        const idsCombinacion = new Set(c.opcionIds);
        return (
          idsCombinacion.size === idsSeleccionados.size &&
          [...idsCombinacion].every((id) => idsSeleccionados.has(id))
        );
      }) ?? null
    );
  }, [producto.combinaciones, opcionesSeleccionadas, grupos.size]);

  const precioUnitario = calcularPrecioUnitario({
    precioBase: producto.precioBase,
    precioDescuento: producto.precioDescuento,
    precioCombinacion: combinacionSeleccionada?.precio ?? null,
    opciones: opcionesSeleccionadas,
    personalizaciones: Object.values(personalizaciones).map((p) => ({
      precioExtra: p.precioExtra,
    })),
  });

  const faltanGrupos =
    grupos.size > 0 && opcionesSeleccionadas.length < grupos.size;

  const faltanPersonalizacionesObligatorias = producto.personalizaciones.some(
    (p) => p.obligatorio && !personalizaciones[p.id]?.valido,
  );

  const sinStock =
    combinacionSeleccionada?.stock !== null &&
    combinacionSeleccionada?.stock !== undefined &&
    combinacionSeleccionada.stock <= 0;

  const agotadoGlobal = producto.estado === "AGOTADO";

  const puedeAgregar =
    !agotadoGlobal &&
    !faltanGrupos &&
    !faltanPersonalizacionesObligatorias &&
    !sinStock;

  function handleAgregar() {
    setIntentoEnviar(true);
    if (!puedeAgregar) return;

    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      imagenUrl: activeImageUrl,
      precioUnitario,
      cantidad,
      tiempoProduccion: producto.tiempoProduccion,
      combinacionId: combinacionSeleccionada?.id ?? null,
      opciones: opcionesSeleccionadas.map((o) => ({
        opcionId: o.id,
        nombre: o.nombre,
        tipo: o.tipo,
        precioExtra: o.precioExtra,
      })),
      personalizaciones: producto.personalizaciones
        .filter((p) => personalizaciones[p.id]?.valor)
        .map((p) => ({
          personalizacionId: p.id,
          nombre: p.nombre,
          tipo: p.tipo,
          valor: personalizaciones[p.id]!.valor,
          precioExtra: personalizaciones[p.id]!.precioExtra,
        })),
    });

    toast({ title: "Producto agregado al carrito", variant: "success" });
    openDrawer();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <ProductGallery
        imagenes={producto.imagenes}
        activeUrl={activeImageUrl}
        onSelect={setActiveImageUrl}
      />

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {producto.nombre}
        </h1>

        <div className="mt-2 flex items-center gap-2">
          {producto.precioDescuento &&
          producto.precioDescuento < producto.precioBase ? (
            <>
              <span className="text-2xl font-bold text-gray-900">
                {formatCOP(precioUnitario)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatCOP(producto.precioBase)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              {formatCOP(precioUnitario)}
            </span>
          )}
        </div>

        {producto.tiempoProduccion ? (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-pill bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-700">
            <Clock className="size-3.5" />
            Producción estimada: {producto.tiempoProduccion} día(s)
          </span>
        ) : null}

        {producto.descripcionLarga && (
          <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
            {producto.descripcionLarga}
          </p>
        )}

        {grupos.size > 0 && (
          <div className="mt-6 space-y-4">
            {[...grupos.entries()].map(([tipo, opciones]) => (
              <div key={tipo}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {tipo}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opciones.map((opcion) => {
                    const activa = seleccion[tipo] === opcion.id;
                    return (
                      <button
                        key={opcion.id}
                        type="button"
                        onClick={() => {
                          setSeleccion((prev) => ({
                            ...prev,
                            [tipo]: opcion.id,
                          }));
                          if (opcion.imagen) setActiveImageUrl(opcion.imagen);
                        }}
                        className={clsx(
                          "rounded-button border px-4 py-2 text-sm font-medium transition-colors",
                          activa
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300",
                        )}
                      >
                        {opcion.nombre}
                        {opcion.precioExtra > 0
                          ? ` (+${formatCOP(opcion.precioExtra)})`
                          : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {intentoEnviar && faltanGrupos && (
              <p className="text-xs text-error">
                Selecciona una opción de cada tipo.
              </p>
            )}
          </div>
        )}

        {producto.personalizaciones.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
            <p className="text-sm font-semibold text-gray-800">
              Personaliza tu producto
            </p>
            {producto.personalizaciones.map((field) => (
              <PersonalizationFieldInput
                key={field.id}
                field={field}
                onChange={(result) =>
                  setPersonalizaciones((prev) => ({
                    ...prev,
                    [field.id]: result,
                  }))
                }
              />
            ))}
            {intentoEnviar && faltanPersonalizacionesObligatorias && (
              <p className="text-xs text-error">
                Completa los campos obligatorios antes de continuar.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center rounded-input border border-gray-200">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="flex size-10 items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((c) => c + 1)}
              className="flex size-10 items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              +
            </button>
          </div>

          <Button
            onClick={handleAgregar}
            className="flex-1"
            disabled={agotadoGlobal || sinStock}
          >
            <ShoppingBag className="size-4" />
            {agotadoGlobal || sinStock ? "Agotado" : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </div>
  );
}

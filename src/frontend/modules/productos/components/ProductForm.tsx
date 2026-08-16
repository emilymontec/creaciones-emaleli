"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  createProductAction,
  type ProductFormState,
} from "@/src/backend/modules/productos/actions/createProduct";
import { updateProductAction } from "@/src/backend/modules/productos/actions/updateProduct";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { Select } from "@/src/frontend/components/ui/Select";
import { SearchableSelect } from "@/src/frontend/components/ui/SearchableSelect";
import { Button } from "@/src/frontend/components/ui/Button";
import { slugify } from "@/src/shared/lib/slug";
import { useToast } from "@/src/frontend/providers/ToastProvider";

export interface ProductDTO {
  id: string;
  nombre: string;
  slug: string;
  descripcionCorta: string | null;
  descripcionLarga: string | null;
  precioBase: string | number;
  precioDescuento: string | number | null;
  tiempoProduccion: number | null;
  estado: "ACTIVO" | "INACTIVO" | "AGOTADO";
  destacado: boolean;
  seoTitulo: string | null;
  seoDescripcion: string | null;
  seoImagen: string | null;
  categorias: { id: string; nombre: string }[];
  imagenes: { url: string }[];
}

const ESTADO_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "AGOTADO", label: "Agotado" },
];

const initialState: ProductFormState = { success: false };

export function ProductForm({
  product,
  categoriaOptions,
  onSuccess,
}: {
  product?: ProductDTO;
  categoriaOptions: { id: string; nombre: string }[];
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(product);
  const action = isEditing ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const { toast } = useToast();

  const [nombre, setNombre] = useState(product?.nombre ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [categoriaIds, setCategoriaIds] = useState<string[]>(
    product?.categorias.map((c) => c.id) ?? [],
  );
  const [preview, setPreview] = useState<string | null>(
    product?.seoImagen ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: isEditing ? "Producto actualizado" : "Producto creado",
        variant: "success",
      });
      onSuccess?.();
    } else if (state.message) {
      toast({
        title: "No se pudo guardar",
        description: state.message,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleNombreChange(value: string) {
    setNombre(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="space-y-5">
      {isEditing && <input type="hidden" name="id" value={product!.id} />}
      {isEditing && (
        <input
          type="hidden"
          name="seoImagenActual"
          value={product?.seoImagen ?? ""}
        />
      )}
      {categoriaIds.map((id) => (
        <input key={id} type="hidden" name="categoriaIds" value={id} />
      ))}

      {state.message && (
        <p className="text-sm font-medium text-error">{state.message}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="nombre"
          label="Nombre"
          placeholder="Ej. Camiseta oversize"
          value={nombre}
          onChange={(e) => handleNombreChange(e.target.value)}
          error={state.errors?.nombre?.[0]}
        />

        <Input
          name="slug"
          label="Slug"
          placeholder="camiseta-oversize"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          helperText="Editable. Debe ser único."
          error={state.errors?.slug?.[0]}
        />
      </div>

      <Input
        name="descripcionCorta"
        label="Descripción corta"
        placeholder="Frase breve que aparece en las tarjetas del catálogo"
        maxLength={200}
        defaultValue={product?.descripcionCorta ?? ""}
        error={state.errors?.descripcionCorta?.[0]}
      />

      <Textarea
        name="descripcionLarga"
        label="Descripción larga"
        placeholder="Descripción detallada del producto (se muestra en la ficha)"
        rows={5}
        defaultValue={product?.descripcionLarga ?? ""}
        error={state.errors?.descripcionLarga?.[0]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          name="precioBase"
          type="number"
          step="0.01"
          min="0"
          label="Precio base"
          placeholder="0.00"
          defaultValue={product?.precioBase?.toString() ?? ""}
          error={state.errors?.precioBase?.[0]}
        />

        <Input
          name="precioDescuento"
          type="number"
          step="0.01"
          min="0"
          label="Precio con descuento"
          placeholder="Opcional"
          defaultValue={product?.precioDescuento?.toString() ?? ""}
          error={state.errors?.precioDescuento?.[0]}
        />

        <Input
          name="tiempoProduccion"
          type="number"
          min="0"
          label="Tiempo de producción (días)"
          placeholder="Ej. 3"
          defaultValue={product?.tiempoProduccion?.toString() ?? ""}
          error={state.errors?.tiempoProduccion?.[0]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="estado"
          label="Estado"
          options={ESTADO_OPTIONS}
          defaultValue={product?.estado ?? "ACTIVO"}
        />

        <div className="flex items-end pb-2.5">
          <Checkbox
            name="destacado"
            value="true"
            defaultChecked={product?.destacado ?? false}
            label="Producto destacado"
            description="Aparece en la sección de destacados del inicio."
          />
        </div>
      </div>

      <SearchableSelect
        label="Categorías"
        placeholder="Selecciona una o varias categorías"
        multiple
        options={categoriaOptions.map((c) => ({ value: c.id, label: c.nombre }))}
        value={categoriaIds}
        onChange={setCategoriaIds}
        error={state.errors?.categoriaIds?.[0]}
      />

      <fieldset className="rounded-card border border-gray-100 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">
          SEO básico
        </legend>

        <div className="space-y-4 pt-2">
          <Input
            name="seoTitulo"
            label="Título SEO"
            placeholder="Título para buscadores (máx. 70 caracteres)"
            maxLength={70}
            defaultValue={product?.seoTitulo ?? ""}
            error={state.errors?.seoTitulo?.[0]}
          />

          <Textarea
            name="seoDescripcion"
            label="Meta descripción"
            placeholder="Resumen para buscadores y redes sociales (máx. 160 caracteres)"
            maxLength={160}
            rows={2}
            defaultValue={product?.seoDescripcion ?? ""}
            error={state.errors?.seoDescripcion?.[0]}
          />

          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Imagen OG (para compartir en redes)
            </span>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-input border border-dashed border-gray-200 bg-gray-50">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Vista previa OG"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-5 text-gray-300" aria-hidden />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-button border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <ImagePlus className="size-3.5" />
                  {preview ? "Cambiar imagen" : "Subir imagen"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="seoImagenArchivo"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setPreview(product?.seoImagen ?? null);
                    }}
                    className="inline-flex w-fit items-center gap-1 text-xs text-gray-400 hover:text-error"
                  >
                    <X className="size-3" /> Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <Button type="submit" loading={pending} fullWidth>
        {isEditing ? "Guardar cambios" : "Guardar producto"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  createCategoryAction,
  type CategoryFormState,
} from "@/src/backend/modules/categorias/actions/createCategory";
import { updateCategoryAction } from "@/src/backend/modules/categorias/actions/updateCategory";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { Button } from "@/src/frontend/components/ui/Button";
import { slugify } from "@/src/shared/lib/slug";
import { useToast } from "@/src/frontend/providers/ToastProvider";

export interface CategoryDTO {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen: string | null;
  activo: boolean;
}

interface CategoryFormProps {
  category?: CategoryDTO;
  onSuccess?: () => void;
}

const initialState: CategoryFormState = { success: false };

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const isEditing = Boolean(category);
  const action = isEditing ? updateCategoryAction : createCategoryAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const { toast } = useToast();

  const [nombre, setNombre] = useState(category?.nombre ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [preview, setPreview] = useState<string | null>(
    category?.imagen ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: isEditing ? "Categoría actualizada" : "Categoría creada",
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
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(category?.imagen ?? null);
  }

  return (
    <form action={formAction} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={category!.id} />}
      {isEditing && (
        <input
          type="hidden"
          name="imagenActual"
          value={category?.imagen ?? ""}
        />
      )}

      {state.message && (
        <p className="text-sm font-medium text-error">{state.message}</p>
      )}

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Imagen
        </span>
        <div className="flex items-center gap-4">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-dashed border-gray-200 bg-gray-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa de la categoría"
                className="size-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6 text-gray-300" aria-hidden />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-button border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <ImagePlus className="size-3.5" />
              {preview ? "Cambiar imagen" : "Subir imagen"}
              <input
                ref={fileInputRef}
                type="file"
                name="imagenArchivo"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {preview && (
              <button
                type="button"
                onClick={clearFile}
                className="inline-flex w-fit items-center gap-1 text-xs text-gray-400 hover:text-error"
              >
                <X className="size-3" /> Quitar
              </button>
            )}
            <p className="text-xs text-gray-400">
              JPG, PNG o WebP. Máx. 5 MB.
            </p>
          </div>
        </div>
      </div>

      <Input
        name="nombre"
        label="Nombre"
        placeholder="Ej. Vestidos"
        value={nombre}
        onChange={(e) => handleNombreChange(e.target.value)}
        error={state.errors?.nombre?.[0]}
      />

      <Input
        name="slug"
        label="Slug"
        placeholder="ej-vestidos"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(slugify(e.target.value));
        }}
        helperText="Se usa en la URL pública. Se genera automáticamente a partir del nombre, pero puedes editarlo."
        error={state.errors?.slug?.[0]}
      />

      <Textarea
        name="descripcion"
        label="Descripción"
        placeholder="Describe brevemente la categoría"
        defaultValue={category?.descripcion ?? ""}
        error={state.errors?.descripcion?.[0]}
      />

      <Checkbox
        name="activo"
        value="true"
        defaultChecked={category?.activo ?? true}
        label="Categoría activa"
        description="Si la desactivas, se oculta de la tienda pública."
      />

      <Button type="submit" loading={pending} fullWidth>
        {isEditing ? "Guardar cambios" : "Guardar categoría"}
      </Button>
    </form>
  );
}

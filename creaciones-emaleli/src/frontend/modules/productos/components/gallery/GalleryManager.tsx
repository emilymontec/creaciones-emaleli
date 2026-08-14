"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/src/frontend/components/ui/Button";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import {
  deleteGalleryImageAction,
  reorderGalleryAction,
  setGalleryPrincipalAction,
  uploadGalleryImagesAction,
} from "@/src/backend/modules/productos/actions/manageGallery";

export interface GalleryImageDTO {
  id: string;
  url: string;
  principal: boolean;
  orden: number;
}

export function GalleryManager({
  productoId,
  imagenes: initialImagenes,
}: {
  productoId: string;
  imagenes: GalleryImageDTO[];
}) {
  const [imagenes, setImagenes] = useState(initialImagenes);
  const [prevInitial, setPrevInitial] = useState(initialImagenes);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (initialImagenes !== prevInitial) {
    setPrevInitial(initialImagenes);
    setImagenes(initialImagenes);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("archivos", file));

    startTransition(async () => {
      const result = await uploadGalleryImagesAction(productoId, formData);
      if (!result.success) {
        toast({
          title: "No se pudieron subir las imágenes",
          description: result.message,
          variant: "error",
        });
      } else {
        toast({ title: "Imágenes subidas", variant: "success" });
      }
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...imagenes];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setImagenes(next);
    setDragIndex(null);

    startTransition(async () => {
      const result = await reorderGalleryAction(
        productoId,
        next.map((i) => i.id),
      );
      if (!result.success) {
        toast({ title: "No se pudo reordenar", variant: "error" });
        setImagenes(initialImagenes);
      }
    });
  }

  function handleSetPrincipal(id: string) {
    setImagenes((prev) => prev.map((i) => ({ ...i, principal: i.id === id })));
    startTransition(async () => {
      const result = await setGalleryPrincipalAction(productoId, id);
      if (!result.success) {
        toast({ title: "No se pudo actualizar", variant: "error" });
        setImagenes(initialImagenes);
      }
    });
  }

  function handleDelete(id: string) {
    setImagenes((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      const result = await deleteGalleryImageAction(productoId, id);
      if (!result.success) {
        toast({
          title: "No se pudo eliminar",
          description: result.message,
          variant: "error",
        });
        setImagenes(initialImagenes);
      } else {
        toast({ title: "Imagen eliminada", variant: "success" });
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Arrastra para reordenar. Máx. 10 imágenes, JPG/PNG/WebP.
        </p>
        <Button
          onClick={() => inputRef.current?.click()}
          loading={isPending}
          disabled={imagenes.length >= 10}
        >
          <ImagePlus className="size-4" />
          Subir imágenes
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {imagenes.length === 0 ? (
        <EmptyState
          title="Sin imágenes"
          description="Sube al menos una imagen para que el producto pueda mostrarse en la tienda."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {imagenes.map((imagen, index) => (
            <div
              key={imagen.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={clsx(
                "group relative aspect-square cursor-grab overflow-hidden rounded-card border active:cursor-grabbing",
                imagen.principal ? "border-primary-400" : "border-gray-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagen.url}
                alt="Imagen del producto"
                className="size-full object-cover"
              />

              {imagen.principal && (
                <span className="absolute left-2 top-2 rounded-pill bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Principal
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!imagen.principal && (
                  <button
                    type="button"
                    onClick={() => handleSetPrincipal(imagen.id)}
                    aria-label="Marcar como principal"
                    className="flex size-7 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(imagen.id)}
                  aria-label="Eliminar imagen"
                  className="flex size-7 items-center justify-center rounded-full bg-white/90 text-error hover:bg-white"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

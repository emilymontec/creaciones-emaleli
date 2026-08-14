"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import clsx from "clsx";

export interface GalleryImage {
  id: string;
  url: string;
}

export function ProductGallery({
  imagenes,
  activeUrl,
  onSelect,
}: {
  imagenes: GalleryImage[];
  activeUrl: string | null;
  onSelect: (url: string) => void;
}) {
  const [zoomed, setZoomed] = useState(false);

  const principal = activeUrl ?? imagenes[0]?.url ?? null;

  return (
    <div>
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-card bg-gray-50"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {principal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={principal}
            alt="Imagen del producto"
            className={clsx(
              "size-full object-cover transition-transform duration-300",
              zoomed && "scale-125",
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-10 text-gray-300" />
          </div>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {imagenes.map((imagen) => (
            <button
              key={imagen.id}
              type="button"
              onClick={() => onSelect(imagen.url)}
              className={clsx(
                "aspect-square overflow-hidden rounded-input border-2 transition-colors",
                principal === imagen.url
                  ? "border-primary-500"
                  : "border-transparent hover:border-gray-200",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagen.url}
                alt="Miniatura del producto"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import clsx from "clsx";
import { Image, Layers, PenTool } from "lucide-react";
import { GalleryManager, type GalleryImageDTO } from "../gallery/GalleryManager";
import {
  VariantsManager,
  type OpcionDTO,
  type CombinacionDTO,
} from "../variants/VariantsManager";
import {
  PersonalizationsBuilder,
  type PersonalizationFieldDTO,
} from "../personalizations/PersonalizationsBuilder";

const TABS = [
  { key: "galeria", label: "Galería", Icon: Image },
  { key: "variantes", label: "Variantes", Icon: Layers },
  { key: "personalizaciones", label: "Personalizaciones", Icon: PenTool },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProductManageTabs({
  productoId,
  imagenes,
  opciones,
  combinaciones,
  campos,
}: {
  productoId: string;
  imagenes: GalleryImageDTO[];
  opciones: OpcionDTO[];
  combinaciones: CombinacionDTO[];
  campos: PersonalizationFieldDTO[];
}) {
  const [tab, setTab] = useState<TabKey>("galeria");

  return (
    <div>
      <div className="mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-pill border border-gray-100 bg-white p-1 shadow-card">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={clsx(
              "flex items-center gap-1.5 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold transition-all",
              tab === key
                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-card"
                : "text-gray-500 hover:bg-primary-50 hover:text-primary-700",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "galeria" && (
        <GalleryManager productoId={productoId} imagenes={imagenes} />
      )}

      {tab === "variantes" && (
        <VariantsManager
          productoId={productoId}
          opciones={opciones}
          combinaciones={combinaciones}
        />
      )}

      {tab === "personalizaciones" && (
        <PersonalizationsBuilder productoId={productoId} campos={campos} />
      )}
    </div>
  );
}

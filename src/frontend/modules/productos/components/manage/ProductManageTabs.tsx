"use client";

import { useState } from "react";
import clsx from "clsx";
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
  { key: "galeria", label: "Galería" },
  { key: "variantes", label: "Variantes" },
  { key: "personalizaciones", label: "Personalizaciones" },
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
      <div className="mb-5 flex gap-1 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={clsx(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {t.label}
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

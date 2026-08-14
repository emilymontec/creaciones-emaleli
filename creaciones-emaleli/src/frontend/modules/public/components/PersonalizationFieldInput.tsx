"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/src/frontend/components/ui/Input";
import { Textarea } from "@/src/frontend/components/ui/Textarea";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";

export interface PersonalizationFieldPublicDTO {
  id: string;
  nombre: string;
  tipo:
    | "TEXTO"
    | "TEXTAREA"
    | "NUMERO"
    | "COLOR"
    | "ARCHIVO"
    | "LISTA"
    | "CHECKBOX";
  obligatorio: boolean;
  precioExtra: number | null;
  opciones: {
    maxLength?: number;
    min?: number;
    max?: number;
    maxSizeMB?: number;
    allowedTypes?: string[];
    opciones?: { label: string; precioExtra: number }[];
  } | null;
}

export interface PersonalizationResult {
  valor: string;
  precioExtra: number;
  valido: boolean;
}

export function PersonalizationFieldInput({
  field,
  onChange,
}: {
  field: PersonalizationFieldPublicDTO;
  onChange: (result: PersonalizationResult) => void;
}) {
  const config = field.opciones ?? {};
  const precioFijo = field.precioExtra ?? 0;

  const [error, setError] = useState<string | null>(null);

  function report(valor: string, extra: number, valido: boolean) {
    setError(
      !valido && valor !== ""
        ? "El valor no cumple con las reglas de este campo."
        : null,
    );
    onChange({ valor, precioExtra: extra, valido });
  }

  const label = (
    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
      {field.nombre}
      {field.obligatorio && <span className="text-error">*</span>}
      {precioFijo > 0 && (
        <span className="text-xs font-normal text-gray-400">
          (+${precioFijo.toLocaleString("es-CO")})
        </span>
      )}
    </label>
  );

  if (field.tipo === "TEXTO") {
    return (
      <div>
        {label}
        <Input
          maxLength={config.maxLength}
          onChange={(e) => {
            const v = e.target.value;
            report(v, v ? precioFijo : 0, v.trim() !== "");
          }}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {config.maxLength && (
          <p className="mt-1 text-xs text-gray-400">
            Máximo {config.maxLength} caracteres.
          </p>
        )}
      </div>
    );
  }

  if (field.tipo === "TEXTAREA") {
    return (
      <div>
        {label}
        <Textarea
          maxLength={config.maxLength}
          onChange={(e) => {
            const v = e.target.value;
            report(v, v ? precioFijo : 0, v.trim() !== "");
          }}
        />
        {config.maxLength && (
          <p className="mt-1 text-xs text-gray-400">
            Máximo {config.maxLength} caracteres.
          </p>
        )}
      </div>
    );
  }

  if (field.tipo === "NUMERO") {
    return (
      <div>
        {label}
        <Input
          type="number"
          min={config.min}
          max={config.max}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return report("", 0, false);
            const n = Number(v);
            const dentroDeRango =
              (config.min === undefined || n >= config.min) &&
              (config.max === undefined || n <= config.max);
            report(v, precioFijo, dentroDeRango);
          }}
        />
        {(config.min !== undefined || config.max !== undefined) && (
          <p className="mt-1 text-xs text-gray-400">
            {config.min !== undefined ? `Mín. ${config.min}` : ""}
            {config.min !== undefined && config.max !== undefined ? " · " : ""}
            {config.max !== undefined ? `Máx. ${config.max}` : ""}
          </p>
        )}
      </div>
    );
  }

  if (field.tipo === "COLOR") {
    return (
      <div>
        {label}
        <input
          type="color"
          defaultValue="#9491bc"
          onChange={(e) => report(e.target.value, precioFijo, true)}
          className="h-10 w-16 cursor-pointer rounded-input border border-gray-200"
        />
      </div>
    );
  }

  if (field.tipo === "CHECKBOX") {
    return (
      <Checkbox
        label={
          field.nombre +
          (precioFijo > 0 ? ` (+$${precioFijo.toLocaleString("es-CO")})` : "")
        }
        onChange={(e) =>
          report(
            e.target.checked ? "Sí" : "",
            e.target.checked ? precioFijo : 0,
            true,
          )
        }
      />
    );
  }

  if (field.tipo === "ARCHIVO") {
    const maxSizeMB = config.maxSizeMB ?? 5;
    const allowedTypes = config.allowedTypes;

    return (
      <div>
        {label}
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-button border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
          <Upload className="size-4" />
          Subir archivo
          <input
            type="file"
            accept={allowedTypes?.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return report("", 0, false);

              if (allowedTypes && !allowedTypes.includes(file.type)) {
                setError("Formato de archivo no permitido.");
                onChange({ valor: "", precioExtra: 0, valido: false });
                return;
              }
              if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`El archivo supera los ${maxSizeMB}MB permitidos.`);
                onChange({ valor: "", precioExtra: 0, valido: false });
                return;
              }
              report(file.name, precioFijo, true);
            }}
          />
        </label>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        <p className="mt-1 text-xs text-gray-400">
          Máx. {maxSizeMB}MB
          {allowedTypes ? ` · ${allowedTypes.join(", ")}` : ""}
        </p>
      </div>
    );
  }

  if (field.tipo === "LISTA") {
    const opciones = config.opciones ?? [];
    return (
      <div>
        {label}
        <select
          defaultValue=""
          onChange={(e) => {
            const idx = Number(e.target.value);
            if (Number.isNaN(idx)) return report("", 0, false);
            const opcion = opciones[idx];
            report(opcion.label, opcion.precioExtra, true);
          }}
          className="w-full rounded-input border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {opciones.map((op, idx) => (
            <option key={op.label} value={idx}>
              {op.label}
              {op.precioExtra > 0
                ? ` (+$${op.precioExtra.toLocaleString("es-CO")})`
                : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

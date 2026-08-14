"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/src/frontend/components/ui/Input";
import { Select } from "@/src/frontend/components/ui/Select";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { Button } from "@/src/frontend/components/ui/Button";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import {
  createFieldAction,
  updateFieldAction,
} from "@/src/backend/modules/productos/actions/managePersonalizations";
import type { PersonalizationFieldDTO } from "./PersonalizationsBuilder";

const TIPO_OPTIONS = [
  { value: "TEXTO", label: "Texto corto" },
  { value: "TEXTAREA", label: "Texto largo" },
  { value: "NUMERO", label: "Número" },
  { value: "COLOR", label: "Color" },
  { value: "ARCHIVO", label: "Archivo" },
  { value: "LISTA", label: "Lista de opciones" },
  { value: "CHECKBOX", label: "Checkbox" },
];

export function PersonalizationFieldForm({
  productoId,
  field,
  onSuccess,
}: {
  productoId: string;
  field?: PersonalizationFieldDTO;
  onSuccess: () => void;
}) {
  const isEditing = Boolean(field);
  const [nombre, setNombre] = useState(field?.nombre ?? "");
  const [tipo, setTipo] = useState(field?.tipo ?? "TEXTO");
  const [obligatorio, setObligatorio] = useState(field?.obligatorio ?? false);
  const [precioExtra, setPrecioExtra] = useState(
    field?.precioExtra?.toString() ?? "",
  );
  const config = (field?.opciones ?? {}) as Record<string, unknown>;
  const [maxLength, setMaxLength] = useState(
    (config.maxLength as number | undefined)?.toString() ?? "",
  );
  const [min, setMin] = useState((config.min as number | undefined)?.toString() ?? "");
  const [max, setMax] = useState((config.max as number | undefined)?.toString() ?? "");
  const [maxSizeMB, setMaxSizeMB] = useState(
    (config.maxSizeMB as number | undefined)?.toString() ?? "5",
  );
  const [allowedTypes, setAllowedTypes] = useState(
    ((config.allowedTypes as string[] | undefined) ?? []).join(", "),
  );
  const [opciones, setOpciones] = useState<
    { label: string; precioExtra: number }[]
  >(
    (config.opciones as { label: string; precioExtra: number }[] | undefined) ?? [
      { label: "", precioExtra: 0 },
    ],
  );
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function buildConfig() {
    switch (tipo) {
      case "TEXTO":
      case "TEXTAREA":
        return maxLength ? { maxLength: Number(maxLength) } : undefined;
      case "NUMERO":
        return {
          ...(min !== "" ? { min: Number(min) } : {}),
          ...(max !== "" ? { max: Number(max) } : {}),
        };
      case "ARCHIVO":
        return {
          maxSizeMB: maxSizeMB ? Number(maxSizeMB) : undefined,
          allowedTypes: allowedTypes
            ? allowedTypes.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined,
        };
      case "LISTA":
        return {
          opciones: opciones.filter((o) => o.label.trim() !== ""),
        };
      default:
        return undefined;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;

    const payload = {
      nombre: nombre.trim(),
      tipo,
      obligatorio,
      precioExtra: precioExtra === "" ? "" : Number(precioExtra),
      config: buildConfig(),
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateFieldAction(productoId, field!.id, payload)
        : await createFieldAction(productoId, payload);

      if (result.success) {
        toast({
          title: isEditing ? "Campo actualizado" : "Campo creado",
          variant: "success",
        });
        onSuccess();
      } else {
        toast({
          title: "No se pudo guardar",
          description: result.message,
          variant: "error",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del campo"
        placeholder="Ej. Texto a estampar"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <Select
        label="Tipo"
        options={TIPO_OPTIONS}
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        disabled={isEditing}
      />

      <div className="grid grid-cols-2 gap-4">
        <Checkbox
          label="Obligatorio"
          checked={obligatorio}
          onChange={(e) => setObligatorio(e.target.checked)}
        />
        <Input
          type="number"
          step="0.01"
          label="Precio adicional (fijo)"
          placeholder="Opcional"
          value={precioExtra}
          onChange={(e) => setPrecioExtra(e.target.value)}
        />
      </div>

      {(tipo === "TEXTO" || tipo === "TEXTAREA") && (
        <Input
          type="number"
          label="Longitud máxima"
          placeholder="Ej. 50"
          value={maxLength}
          onChange={(e) => setMaxLength(e.target.value)}
        />
      )}

      {tipo === "NUMERO" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Valor mínimo"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <Input
            type="number"
            label="Valor máximo"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      )}

      {tipo === "ARCHIVO" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Tamaño máx. (MB)"
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(e.target.value)}
          />
          <Input
            label="Formatos permitidos"
            placeholder="image/png, application/pdf"
            value={allowedTypes}
            onChange={(e) => setAllowedTypes(e.target.value)}
          />
        </div>
      )}

      {tipo === "LISTA" && (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Opciones de la lista
          </span>
          <div className="space-y-2">
            {opciones.map((op, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Nombre de la opción"
                  value={op.label}
                  onChange={(e) =>
                    setOpciones((prev) =>
                      prev.map((o, idx) =>
                        idx === i ? { ...o, label: e.target.value } : o,
                      ),
                    )
                  }
                  className="flex-1 rounded-input border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="+$"
                  value={op.precioExtra}
                  onChange={(e) =>
                    setOpciones((prev) =>
                      prev.map((o, idx) =>
                        idx === i
                          ? { ...o, precioExtra: Number(e.target.value) || 0 }
                          : o,
                      ),
                    )
                  }
                  className="w-20 rounded-input border border-gray-200 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpciones((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-red-50 hover:text-error"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setOpciones((prev) => [...prev, { label: "", precioExtra: 0 }])
            }
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            <Plus className="size-3.5" /> Agregar opción
          </button>
        </div>
      )}

      <Button type="submit" loading={pending} fullWidth>
        {isEditing ? "Guardar cambios" : "Agregar campo"}
      </Button>
    </form>
  );
}

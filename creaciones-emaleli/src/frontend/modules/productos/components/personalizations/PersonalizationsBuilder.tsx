"use client";

import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Button } from "@/src/frontend/components/ui/Button";
import { Card } from "@/src/frontend/components/ui/Card";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import {
  deleteFieldAction,
  reorderFieldsAction,
  toggleFieldActivoAction,
} from "@/src/backend/modules/productos/actions/managePersonalizations";
import { PersonalizationFieldForm } from "./PersonalizationFieldForm";

export interface PersonalizationFieldDTO {
  id: string;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  precioExtra: string | number | null;
  opciones: unknown;
  activo: boolean;
}

const TIPO_LABEL: Record<string, string> = {
  TEXTO: "Texto corto",
  TEXTAREA: "Texto largo",
  NUMERO: "Número",
  COLOR: "Color",
  ARCHIVO: "Archivo",
  LISTA: "Lista",
  CHECKBOX: "Checkbox",
};

export function PersonalizationsBuilder({
  productoId,
  campos: initialCampos,
}: {
  productoId: string;
  campos: PersonalizationFieldDTO[];
}) {
  const [campos, setCampos] = useState(initialCampos);
  const [prevInitial, setPrevInitial] = useState(initialCampos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalizationFieldDTO | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  if (initialCampos !== prevInitial) {
    setPrevInitial(initialCampos);
    setCampos(initialCampos);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...campos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setCampos(next);
    setDragIndex(null);

    startTransition(async () => {
      const result = await reorderFieldsAction(
        productoId,
        next.map((c) => c.id),
      );
      if (!result.success) {
        toast({ title: "No se pudo reordenar", variant: "error" });
        setCampos(initialCampos);
      }
    });
  }

  function handleToggle(id: string) {
    setCampos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c)),
    );
    startTransition(async () => {
      const result = await toggleFieldActivoAction(productoId, id);
      if (!result.success) {
        toast({ title: "No se pudo actualizar", variant: "error" });
        setCampos(initialCampos);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteFieldAction(productoId, id);
      if (result.success) {
        setCampos((prev) => prev.filter((c) => c.id !== id));
        toast({ title: "Campo eliminado", variant: "success" });
      } else {
        toast({
          title: "No se pudo eliminar",
          description: result.message,
          variant: "error",
        });
      }
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-gray-900">
            Campos de personalización
          </h3>
          <p className="text-sm text-gray-500">
            Arrastra para cambiar el orden en que se muestran al cliente.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nuevo campo
        </Button>
      </div>

      {campos.length === 0 ? (
        <EmptyState
          title="Sin campos de personalización"
          description="Este producto no tiene campos que el cliente deba completar."
        />
      ) : (
        <ul className="divide-y divide-gray-50">
          {campos.map((campo, index) => (
            <li
              key={campo.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex cursor-grab items-center gap-3 py-3 active:cursor-grabbing"
            >
              <GripVertical className="size-4 shrink-0 text-gray-300" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {campo.nombre}
                  </span>
                  <Badge variant="primary">
                    {TIPO_LABEL[campo.tipo] ?? campo.tipo}
                  </Badge>
                  {campo.obligatorio && (
                    <Badge variant="warning">Obligatorio</Badge>
                  )}
                  {campo.precioExtra ? (
                    <Badge variant="neutral">
                      +${Number(campo.precioExtra).toLocaleString("es-CO")}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <button type="button" onClick={() => handleToggle(campo.id)}>
                <Badge variant={campo.activo ? "success" : "neutral"}>
                  {campo.activo ? "Activo" : "Inactivo"}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(campo);
                  setFormOpen(true);
                }}
                aria-label={`Editar ${campo.nombre}`}
                className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(campo.id)}
                aria-label={`Eliminar ${campo.nombre}`}
                className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-red-50 hover:text-error"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar campo" : "Nuevo campo de personalización"}
      >
        <PersonalizationFieldForm
          productoId={productoId}
          field={editing ?? undefined}
          onSuccess={() => setFormOpen(false)}
        />
      </Modal>
    </Card>
  );
}

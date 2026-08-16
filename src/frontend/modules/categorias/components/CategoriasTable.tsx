"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, ImageOff, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Button } from "@/src/frontend/components/ui/Button";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { CategoryForm, type CategoryDTO } from "./CategoryForm";
import {
  deleteCategoryAction,
  reorderCategoriasAction,
  toggleCategoryActivoAction,
} from "@/src/backend/modules/categorias/actions/manageCategory";
import { useToast } from "@/src/frontend/providers/ToastProvider";

export function CategoriasTable({
  categorias: initialCategorias,
}: {
  categorias: CategoryDTO[];
}) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [prevInitial, setPrevInitial] = useState(initialCategorias);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [deleting, setDeleting] = useState<CategoryDTO | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Patrón "adjusting state during render" (en vez de useEffect) para
  // resincronizar el estado local con el prop cuando el Server Component
  // vuelve a renderizar (router.refresh()) con datos nuevos.
  if (initialCategorias !== prevInitial) {
    setPrevInitial(initialCategorias);
    setCategorias(initialCategorias);
  }

  if (categorias.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Aún no hay categorías"
          description="Crea la primera categoría para empezar a organizar tus productos."
        />
      </div>
    );
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;

    const next = [...categorias];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setCategorias(next);
    setDragIndex(null);

    startTransition(async () => {
      const result = await reorderCategoriasAction(next.map((c) => c.id));
      if (!result.success) {
        toast({
          title: "No se pudo reordenar",
          description: result.message,
          variant: "error",
        });
        setCategorias(initialCategorias);
      }
    });
  }

  function handleToggleActivo(categoria: CategoryDTO) {
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === categoria.id ? { ...c, activo: !c.activo } : c,
      ),
    );

    startTransition(async () => {
      const result = await toggleCategoryActivoAction(categoria.id);
      if (!result.success) {
        toast({
          title: "No se pudo actualizar el estado",
          description: result.message,
          variant: "error",
        });
        setCategorias((prev) =>
          prev.map((c) => (c.id === categoria.id ? categoria : c)),
        );
      }
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);

    startTransition(async () => {
      const result = await deleteCategoryAction(target.id);
      if (result.success) {
        setCategorias((prev) => prev.filter((c) => c.id !== target.id));
        toast({ title: "Categoría eliminada", variant: "success" });
        router.refresh();
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
    <>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gradient-to-br from-gray-50/80 to-white text-gray-500">
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
              Slug
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
              Orden
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria, index) => (
            <tr
              key={categoria.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
            >
              <td className="cursor-grab px-4 py-3 text-gray-300 active:cursor-grabbing">
                <GripVertical className="size-4" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-input bg-gray-100">
                    {categoria.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={categoria.imagen}
                        alt={categoria.nombre}
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageOff className="size-4 text-gray-300" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800">
                    {categoria.nombre}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{categoria.slug}</td>
              <td className="px-4 py-3 text-gray-500">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleToggleActivo(categoria)}
                  disabled={isPending}
                >
                  <Badge variant={categoria.activo ? "success" : "neutral"}>
                    {categoria.activo ? "Activa" : "Inactiva"}
                  </Badge>
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(categoria)}
                    aria-label={`Editar ${categoria.nombre}`}
                    className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(categoria)}
                    aria-label={`Eliminar ${categoria.nombre}`}
                    className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-red-50 hover:text-error"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Editar categoría"
      >
        {editing && (
          <CategoryForm
            category={editing}
            onSuccess={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar categoría"
        description={
          deleting
            ? `¿Seguro que quieres eliminar "${deleting.nombre}"? Esta acción no se puede deshacer.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Si la categoría tiene productos asociados, no podrás eliminarla
          hasta desactivarla o reasignar sus productos.
        </p>
      </Modal>
    </>
  );
}

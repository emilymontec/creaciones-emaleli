"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Button } from "@/src/frontend/components/ui/Button";
import { Card } from "@/src/frontend/components/ui/Card";
import { Input } from "@/src/frontend/components/ui/Input";
import { Checkbox } from "@/src/frontend/components/ui/Checkbox";
import { EmptyState } from "@/src/frontend/components/ui/EmptyState";
import { useToast } from "@/src/frontend/providers/ToastProvider";
import {
  createOpcionAction,
  deleteOpcionAction,
  deleteCombinacionAction,
  generateCombinacionesAction,
  toggleOpcionActivoAction,
  updateCombinacionAction,
} from "@/src/backend/modules/productos/actions/manageVariants";

export interface OpcionDTO {
  id: string;
  nombre: string;
  tipo: string;
  imagen: string | null;
  precioExtra: string | number;
  activo: boolean;
}

export interface CombinacionDTO {
  id: string;
  sku: string | null;
  precio: string | number | null;
  stock: number | null;
  activo: boolean;
  opciones: OpcionDTO[];
}

export function VariantsManager({
  productoId,
  opciones: initialOpciones,
  combinaciones: initialCombinaciones,
}: {
  productoId: string;
  opciones: OpcionDTO[];
  combinaciones: CombinacionDTO[];
}) {
  const [opciones, setOpciones] = useState(initialOpciones);
  const [combinaciones, setCombinaciones] = useState(initialCombinaciones);
  const [prevOpciones, setPrevOpciones] = useState(initialOpciones);
  const [prevCombinaciones, setPrevCombinaciones] = useState(
    initialCombinaciones,
  );
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  if (initialOpciones !== prevOpciones) {
    setPrevOpciones(initialOpciones);
    setOpciones(initialOpciones);
  }
  if (initialCombinaciones !== prevCombinaciones) {
    setPrevCombinaciones(initialCombinaciones);
    setCombinaciones(initialCombinaciones);
  }

  const grupos = useMemo(() => {
    const map = new Map<string, OpcionDTO[]>();
    for (const o of opciones) {
      if (!map.has(o.tipo)) map.set(o.tipo, []);
      map.get(o.tipo)!.push(o);
    }
    return map;
  }, [opciones]);

  return (
    <div className="space-y-6">
      <OpcionesEditor
        productoId={productoId}
        grupos={grupos}
        onToggle={(id) =>
          startTransition(async () => {
            setOpciones((prev) =>
              prev.map((o) => (o.id === id ? { ...o, activo: !o.activo } : o)),
            );
            const result = await toggleOpcionActivoAction(productoId, id);
            if (!result.success) {
              toast({ title: "No se pudo actualizar", variant: "error" });
              setOpciones(initialOpciones);
            }
          })
        }
        onDelete={(id) =>
          startTransition(async () => {
            const result = await deleteOpcionAction(productoId, id);
            if (result.success) {
              setOpciones((prev) => prev.filter((o) => o.id !== id));
              toast({ title: "Opción eliminada", variant: "success" });
            } else {
              toast({
                title: "No se pudo eliminar",
                description: result.message,
                variant: "error",
              });
            }
          })
        }
        onCreated={() => {
          toast({ title: "Opción creada", variant: "success" });
        }}
      />

      <CombinacionesEditor
        productoId={productoId}
        grupos={grupos}
        combinaciones={combinaciones}
        onGenerated={() => {
          toast({ title: "Matriz generada", variant: "success" });
        }}
        onUpdate={(id, data) =>
          startTransition(async () => {
            const result = await updateCombinacionAction(productoId, id, data);
            if (!result.success) {
              toast({
                title: "No se pudo guardar",
                description: result.message,
                variant: "error",
              });
            }
          })
        }
        onDelete={(id) =>
          startTransition(async () => {
            const result = await deleteCombinacionAction(productoId, id);
            if (result.success) {
              setCombinaciones((prev) => prev.filter((c) => c.id !== id));
            } else {
              toast({ title: "No se pudo eliminar", variant: "error" });
            }
          })
        }
      />
    </div>
  );
}

function OpcionesEditor({
  productoId,
  grupos,
  onToggle,
  onDelete,
  onCreated,
}: {
  productoId: string;
  grupos: Map<string, OpcionDTO[]>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [precioExtra, setPrecioExtra] = useState("0");
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !tipo.trim()) return;

    startTransition(async () => {
      const result = await createOpcionAction({
        productoId,
        nombre: nombre.trim(),
        tipo: tipo.trim(),
        precioExtra: Number(precioExtra) || 0,
      });
      if (result.success) {
        setNombre("");
        setPrecioExtra("0");
        onCreated();
      } else {
        toast({
          title: "No se pudo crear la opción",
          description: result.message,
          variant: "error",
        });
      }
    });
  }

  return (
    <Card>
      <h3 className="mb-1 font-display text-base font-semibold text-gray-900">
        Opciones (talla, color, material...)
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        Cada opción es un valor individual (ej. &quot;Talla M&quot;, &quot;Color rojo&quot;).
        Agrúpalas por tipo para poder generar la matriz de combinaciones.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_140px_auto]"
      >
        <Input
          placeholder="Nombre (ej. Talla M)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <Input
          placeholder="Tipo (ej. TALLA)"
          list="tipos-sugeridos"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        />
        <datalist id="tipos-sugeridos">
          <option value="TALLA" />
          <option value="COLOR" />
          <option value="MATERIAL" />
        </datalist>
        <Input
          type="number"
          step="0.01"
          placeholder="Precio extra"
          value={precioExtra}
          onChange={(e) => setPrecioExtra(e.target.value)}
        />
        <Button type="submit" loading={pending}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </form>

      {grupos.size === 0 ? (
        <EmptyState
          title="Sin opciones todavía"
          description="Agrega la primera opción usando el formulario de arriba."
        />
      ) : (
        <div className="space-y-4">
          {[...grupos.entries()].map(([tipoGrupo, items]) => (
            <div key={tipoGrupo}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {tipoGrupo}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((o) => (
                  <span
                    key={o.id}
                    className="inline-flex items-center gap-2 rounded-pill border border-gray-200 py-1 pl-3 pr-1.5 text-sm"
                  >
                    <button type="button" onClick={() => onToggle(o.id)}>
                      <Badge variant={o.activo ? "success" : "neutral"}>
                        {o.nombre}
                        {Number(o.precioExtra) > 0
                          ? ` +$${Number(o.precioExtra).toLocaleString("es-CO")}`
                          : ""}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(o.id)}
                      aria-label={`Eliminar ${o.nombre}`}
                      className="flex size-5 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-error"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CombinacionesEditor({
  productoId,
  grupos,
  combinaciones,
  onGenerated,
  onUpdate,
  onDelete,
}: {
  productoId: string;
  grupos: Map<string, OpcionDTO[]>;
  combinaciones: CombinacionDTO[];
  onGenerated: () => void;
  onUpdate: (
    id: string,
    data: { sku: string; precio: string | number; stock: string | number; activo: boolean },
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function toggleSeleccion(tipo: string, id: string) {
    setSeleccion((prev) => {
      const actual = prev[tipo] ?? [];
      const next = actual.includes(id)
        ? actual.filter((x) => x !== id)
        : [...actual, id];
      return { ...prev, [tipo]: next };
    });
  }

  function handleGenerar() {
    const grupoIds = Object.values(seleccion).filter((g) => g.length > 0);

    startTransition(async () => {
      const result = await generateCombinacionesAction(productoId, grupoIds);
      if (result.success) {
        onGenerated();
      } else {
        toast({
          title: "No se pudo generar la matriz",
          description: result.message,
          variant: "error",
        });
      }
    });
  }

  if (grupos.size === 0) return null;

  return (
    <Card>
      <h3 className="mb-1 font-display text-base font-semibold text-gray-900">
        Matriz de combinaciones
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        Selecciona las opciones a combinar y genera la matriz. Cada
        combinación tiene su propio stock y precio (opcional).
      </p>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...grupos.entries()].map(([tipo, items]) => (
          <div key={tipo}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {tipo}
            </p>
            <div className="space-y-1.5">
              {items.map((o) => (
                <Checkbox
                  key={o.id}
                  label={o.nombre}
                  checked={(seleccion[tipo] ?? []).includes(o.id)}
                  onChange={() => toggleSeleccion(tipo, o.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleGenerar} loading={pending} variant="secondary">
        Generar combinaciones seleccionadas
      </Button>

      {combinaciones.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-2 pr-3 font-semibold">Combinación</th>
                <th className="py-2 pr-3 font-semibold">SKU</th>
                <th className="py-2 pr-3 font-semibold">Precio</th>
                <th className="py-2 pr-3 font-semibold">Stock</th>
                <th className="py-2 pr-3 font-semibold">Activa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {combinaciones.map((c) => (
                <CombinacionRow
                  key={c.id}
                  combinacion={c}
                  onUpdate={(data) => onUpdate(c.id, data)}
                  onDelete={() => onDelete(c.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function CombinacionRow({
  combinacion,
  onUpdate,
  onDelete,
}: {
  combinacion: CombinacionDTO;
  onUpdate: (data: {
    sku: string;
    precio: string | number;
    stock: string | number;
    activo: boolean;
  }) => void;
  onDelete: () => void;
}) {
  const [sku, setSku] = useState(combinacion.sku ?? "");
  const [precio, setPrecio] = useState(combinacion.precio?.toString() ?? "");
  const [stock, setStock] = useState(combinacion.stock?.toString() ?? "");
  const [activo, setActivo] = useState(combinacion.activo);

  function save(overrides?: Partial<{ activo: boolean }>) {
    onUpdate({
      sku,
      precio: precio === "" ? "" : Number(precio),
      stock: stock === "" ? "" : Number(stock),
      activo: overrides?.activo ?? activo,
    });
  }

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-2 pr-3">
        <div className="flex flex-wrap gap-1">
          {combinacion.opciones.map((o) => (
            <Badge key={o.id} variant="primary">
              {o.nombre}
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-2 pr-3">
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onBlur={() => save()}
          placeholder="Opcional"
          className="w-28 rounded-input border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-100"
        />
      </td>
      <td className="py-2 pr-3">
        <input
          type="number"
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          onBlur={() => save()}
          placeholder="Precio base"
          className="w-24 rounded-input border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-100"
        />
      </td>
      <td className="py-2 pr-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          onBlur={() => save()}
          placeholder="—"
          className="w-20 rounded-input border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-100"
        />
      </td>
      <td className="py-2 pr-3">
        <Checkbox
          checked={activo}
          onChange={() => {
            const next = !activo;
            setActivo(next);
            save({ activo: next });
          }}
        />
      </td>
      <td className="py-2 text-right">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar combinación"
          className="flex size-7 items-center justify-center rounded-input text-gray-400 hover:bg-red-50 hover:text-error"
        >
          <Trash2 className="size-3.5" />
        </button>
      </td>
    </tr>
  );
}

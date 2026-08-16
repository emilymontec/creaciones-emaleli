"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Layers, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/src/frontend/components/ui/Badge";
import { Button } from "@/src/frontend/components/ui/Button";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { Table, type TableColumn } from "@/src/frontend/components/ui/Table";
import { AdminListPagination } from "@/src/frontend/components/shared/AdminListPagination";
import { ProductForm, type ProductDTO } from "./ProductForm";
import {
  deleteProductAction,
  setProductEstadoAction,
} from "@/src/backend/modules/productos/actions/manageProduct";
import { useToast } from "@/src/frontend/providers/ToastProvider";

const ESTADO_LABEL: Record<ProductDTO["estado"], string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  AGOTADO: "Agotado",
};

function formatPrecio(value: string | number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function ProductsTable({
  productos: initialProductos,
  categoriaOptions,
  pagination,
}: {
  productos: ProductDTO[];
  categoriaOptions: { id: string; nombre: string }[];
  pagination?: { page: number; totalPages: number; total: number };
}) {
  const [productos, setProductos] = useState(initialProductos);
  const [prevInitial, setPrevInitial] = useState(initialProductos);
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [deleting, setDeleting] = useState<ProductDTO | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (initialProductos !== prevInitial) {
    setPrevInitial(initialProductos);
    setProductos(initialProductos);
  }

  function handleEstadoChange(
    producto: ProductDTO,
    estado: ProductDTO["estado"],
  ) {
    const previous = producto.estado;
    setProductos((prev) =>
      prev.map((p) => (p.id === producto.id ? { ...p, estado } : p)),
    );

    startTransition(async () => {
      const result = await setProductEstadoAction(producto.id, estado);
      if (!result.success) {
        toast({
          title: "No se pudo actualizar el estado",
          description: result.message,
          variant: "error",
        });
        setProductos((prev) =>
          prev.map((p) =>
            p.id === producto.id ? { ...p, estado: previous } : p,
          ),
        );
      }
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);

    startTransition(async () => {
      const result = await deleteProductAction(target.id);
      if (result.success) {
        setProductos((prev) => prev.filter((p) => p.id !== target.id));
        toast({ title: "Producto eliminado", variant: "success" });
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

  const columns: TableColumn<ProductDTO>[] = [
    {
      key: "nombre",
      header: "Producto",
      sortable: true,
      sortValue: (p) => p.nombre,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-input bg-gray-100">
            {p.imagenes[0]?.url ?? p.seoImagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imagenes[0]?.url ?? p.seoImagen!}
                alt={p.nombre}
                className="size-full object-cover"
              />
            ) : (
              <ImageOff className="size-4 text-gray-300" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{p.nombre}</p>
            <p className="text-xs text-gray-400">{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "categorias",
      header: "Categorías",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.categorias.map((c) => (
            <Badge key={c.id} variant="primary">
              {c.nombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "precio",
      header: "Precio",
      sortable: true,
      sortValue: (p) => Number(p.precioBase),
      render: (p) => (
        <div>
          {p.precioDescuento ? (
            <>
              <span className="mr-1.5 text-gray-400 line-through">
                {formatPrecio(p.precioBase)}
              </span>
              <span className="font-medium text-gray-800">
                {formatPrecio(p.precioDescuento)}
              </span>
            </>
          ) : (
            <span className="font-medium text-gray-800">
              {formatPrecio(p.precioBase)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "produccion",
      header: "Producción",
      render: (p) =>
        p.tiempoProduccion ? `${p.tiempoProduccion} día(s)` : "—",
    },
    {
      key: "estado",
      header: "Estado",
      render: (p) => (
        <select
          value={p.estado}
          onChange={(e) =>
            handleEstadoChange(p, e.target.value as ProductDTO["estado"])
          }
          className="rounded-pill border-0 bg-transparent text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-100"
        >
          {(["ACTIVO", "INACTIVO", "AGOTADO"] as const).map((estado) => (
            <option key={estado} value={estado}>
              {ESTADO_LABEL[estado]}
            </option>
          ))}
        </select>
      ),
      className: "min-w-[9rem]",
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={productos}
        rowKey={(p) => p.id}
        emptyTitle="Aún no hay productos"
        emptyDescription="Crea el primer producto para empezar a vender."
        actions={(p) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/productos/${p.id}`}
              aria-label={`Gestionar galería, variantes y personalizaciones de ${p.nombre}`}
              className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Galería, variantes y personalizaciones"
            >
              <Layers className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setEditing(p)}
              aria-label={`Editar ${p.nombre}`}
              className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleting(p)}
              aria-label={`Eliminar ${p.nombre}`}
              className="flex size-8 items-center justify-center rounded-input text-gray-400 hover:bg-red-50 hover:text-error"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      {pagination && pagination.totalPages > 1 && (
        <AdminListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="producto"
        />
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Editar producto"
        size="lg"
      >
        {editing && (
          <ProductForm
            product={editing}
            categoriaOptions={categoriaOptions}
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
        title="Eliminar producto"
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
          Si el producto ya tiene pedidos asociados, no podrás eliminarlo
          hasta cambiarlo a &quot;Inactivo&quot;.
        </p>
      </Modal>
    </>
  );
}

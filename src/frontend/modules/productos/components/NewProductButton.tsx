"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/src/frontend/components/ui/Button";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { ProductForm } from "./ProductForm";

export function NewProductButton({
  categoriaOptions,
}: {
  categoriaOptions: { id: string; nombre: string }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nuevo producto
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo producto"
        description="Completa la información base del producto. Variantes y personalizaciones se configuran después de crearlo."
        size="lg"
      >
        <ProductForm
          categoriaOptions={categoriaOptions}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}

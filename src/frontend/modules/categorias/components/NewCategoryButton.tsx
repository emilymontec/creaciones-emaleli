"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/src/frontend/components/ui/Button";
import { Modal } from "@/src/frontend/components/ui/Modal";
import { CategoryForm } from "./CategoryForm";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nueva categoría
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva categoría"
        description="Crea una categoría para organizar el catálogo de la tienda."
      >
        <CategoryForm
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}

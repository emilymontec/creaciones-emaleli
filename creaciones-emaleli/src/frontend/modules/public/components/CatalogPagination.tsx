"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/src/frontend/components/ui/Pagination";

export function CatalogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`/catalogo?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
  );
}

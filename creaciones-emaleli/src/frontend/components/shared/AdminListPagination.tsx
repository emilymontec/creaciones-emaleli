"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@/src/frontend/components/ui/Pagination";

export function AdminListPagination({
  page,
  totalPages,
  total,
  itemLabel,
}: {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(nextPage: number) {
    const qs = new URLSearchParams(searchParams.toString());
    if (nextPage > 1) {
      qs.set("page", String(nextPage));
    } else {
      qs.delete("page");
    }
    const query = qs.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-500">
        {total} {itemLabel}
        {total === 1 ? "" : "s"} en total
      </p>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}

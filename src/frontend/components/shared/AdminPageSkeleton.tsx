import { Card } from "@/src/frontend/components/ui/Card";
import { Skeleton, SkeletonTable } from "@/src/frontend/components/ui/Loader";

/**
 * Estado de carga a nivel de ruta para los módulos del panel admin.
 * Next.js lo renderiza automáticamente vía `loading.tsx` mientras el
 * Server Component de la página resuelve sus datos, dando feedback
 * instantáneo al cambiar de módulo en el sidebar.
 */
export function AdminPageSkeleton({
  withMetrics = false,
  metricsCount = 3,
}: {
  withMetrics?: boolean;
  metricsCount?: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {withMetrics && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          style={{
            gridTemplateColumns:
              metricsCount === 4
                ? undefined
                : `repeat(${metricsCount}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: metricsCount }).map((_, i) => (
            <Card key={i} className="flex items-center gap-4 p-5">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <SkeletonTable rows={6} />
      </Card>
    </div>
  );
}

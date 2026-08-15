import { AdminPageSkeleton } from "@/src/frontend/components/shared/AdminPageSkeleton";

export default function Loading() {
  return <AdminPageSkeleton withMetrics metricsCount={3} />;
}

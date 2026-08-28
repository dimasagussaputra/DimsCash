import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Balance hero + mini cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="min-h-36 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-[260px] w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border bg-card p-6">
        <Skeleton className="mb-4 h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

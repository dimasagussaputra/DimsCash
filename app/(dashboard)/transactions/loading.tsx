import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-9 w-full rounded-lg lg:flex-1" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg lg:w-[150px]" />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

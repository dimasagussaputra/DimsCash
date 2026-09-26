import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="w-full flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-9 w-full rounded-lg lg:hidden" />
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton"

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>

      <div className="border rounded-md p-4 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2 border-b">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

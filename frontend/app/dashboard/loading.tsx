import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 border rounded-xl space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-[60px]" />
                        <Skeleton className="h-3 w-[140px]" />
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 p-6 border rounded-xl space-y-4">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="col-span-3 p-6 border rounded-xl space-y-4">
                    <Skeleton className="h-6 w-[150px]" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-[80%]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

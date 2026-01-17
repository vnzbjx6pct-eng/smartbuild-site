import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Skeleton */}
                <div className="w-full md:w-64 space-y-6 shrink-0">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>

                {/* Grid Skeleton */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200">
                                <Skeleton className="aspect-square w-full bg-slate-200" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-3/4 bg-slate-200" />
                                    <Skeleton className="h-4 w-1/2 bg-slate-200" />
                                    <div className="pt-2 flex justify-between items-center">
                                        <Skeleton className="h-6 w-20 bg-slate-200" />
                                        <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
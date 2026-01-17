import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex gap-4">
                            <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-4 w-1/4" />
                                <div className="pt-2 flex justify-between items-center">
                                    <Skeleton className="h-8 w-24 rounded-lg" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

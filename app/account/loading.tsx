import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-slate-200" />
                    <Skeleton className="h-4 w-64 bg-slate-200" />
                </div>
                <Skeleton className="h-12 w-32 rounded-lg bg-slate-200" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full bg-slate-200" />
                            <Skeleton className="h-5 w-32 bg-slate-200" />
                        </div>
                        <Skeleton className="h-8 w-full bg-slate-200" />
                        <Skeleton className="h-4 w-2/3 bg-slate-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}

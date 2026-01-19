import { Skeleton } from "@/components/ui/Skeleton";

export default function LoadingOrder() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="h-8 w-32 bg-slate-200 rounded mb-6"></div>

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between">
                    <div className="h-6 w-48 bg-slate-200 rounded"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded"></div>
                </div>
                <div className="h-10 w-3/4 bg-slate-200 rounded"></div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-32"></div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="h-16 w-16 bg-slate-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                    </div>
                </div>
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="h-16 w-16 bg-slate-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

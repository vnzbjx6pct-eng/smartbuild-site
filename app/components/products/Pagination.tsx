"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Simple pagination logic: show first, last, current, and adjacent
                    if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                    ) {
                        return <span key={page} className="px-1 text-slate-500">...</span>;
                    }
                    return null;
                })}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}

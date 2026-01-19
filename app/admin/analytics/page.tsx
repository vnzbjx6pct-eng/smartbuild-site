import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";
import { ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Admin Analytics — SmartBuild",
    description: "System health and performance monitoring.",
};

export default function AdminAnalyticsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* ADMIN HEADER */}
            <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">A</span>
                            SmartBuild <span className="text-blue-400 text-xs uppercase tracking-widest font-normal opacity-70 mt-1">Admin</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Admin Mode
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors" title="Logi välja">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Süsteemi Ülevaade</h1>
                        <p className="text-slate-500 mt-1">
                            Reaalajas B2B andmed ja kvaliteedikontroll.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            ENV: PRODUCTION
                        </span>
                    </div>
                </div>

                <AdminDashboard />
            </main>
        </div>
    );
}

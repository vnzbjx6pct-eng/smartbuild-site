import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

export const metadata: Metadata = {
    title: "Partneri Töölaud — SmartBuild",
    description: "Halduskeskkond ehituspoodidele.",
};

export default function PartnerDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-100">
            {/* TOP BAR */}
            <header className="bg-[#0f172a] text-white border-b border-slate-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">SB</span>
                            SmartBuild <span className="text-emerald-500 text-xs uppercase tracking-widest font-normal opacity-70 mt-1">Partner</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-700 mx-2"></div>
                        <div className="text-sm font-medium text-slate-300">
                            Espak AS (Demo)
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Süsteem aktiivne
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors" title="Logi välja">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <LayoutDashboard className="text-slate-400" />
                            Ülevaade
                        </h1>
                        <p className="text-slate-500">
                            Siin näete reaalajas sissetulevaid päringuid ja meeskonna koormust.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
                            Ekspordi raport (.csv)
                        </button>
                    </div>
                </div>

                <DashboardClient />
            </main>
        </div>
    );
}

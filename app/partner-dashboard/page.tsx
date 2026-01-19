import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Partner Overview — SmartBuild",
    description: "Executive dashboard for retail partners.",
};

// --- MOCK DATA ---
type StoreStat = {
    city: string;
    storeName: string;
    rfqs: number;
    lastRfq: string;
    status: 'ACTIVE' | 'LOW' | 'INACTIVE';
};

const STATS: StoreStat[] = [
    { city: 'Tallinn', storeName: 'Espak Tallinn', rfqs: 142, lastRfq: '1 h tagasi', status: 'ACTIVE' },
    { city: 'Tartu', storeName: 'Espak Tartu', rfqs: 89, lastRfq: '4 h tagasi', status: 'ACTIVE' },
    { city: 'Pärnu', storeName: 'Espak Pärnu', rfqs: 56, lastRfq: '1 päev tagasi', status: 'LOW' },
    { city: 'Narva', storeName: 'Espak Narva', rfqs: 0, lastRfq: '-', status: 'INACTIVE' },
    { city: 'Viljandi', storeName: 'Espak Viljandi', rfqs: 12, lastRfq: '3 päeva tagasi', status: 'LOW' },
];

export default function ExecutiveDashboardPage() {
    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-slate-900">
            {/* EXECUTIVE HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl">
                            SB
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Partner Dashboard</div>
                            <div className="font-bold text-xl text-slate-900">Espak AS (Ülevaade)</div>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            🟢 Live System
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container mx-auto px-6 py-12">

                {/* HEADLINE */}
                <div className="mb-12 max-w-4xl">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Hinnapäringute Monitor</h1>
                    <p className="text-lg text-slate-600">
                        See töölaud annab reaalajas ülevaate SmartBuild platvormi kaudu saabuvatest B2B/B2C hinnapäringutest.
                        Andmed on koondatud linnade kaupa.
                    </p>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 font-medium mb-2">Päringuid kokku (30p)</div>
                        <div className="text-4xl font-black text-slate-900">299</div>
                        <div className="text-emerald-500 text-sm font-bold mt-2">↑ 12% vs eelmine kuu</div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 font-medium mb-2">Aktiivseid linnu</div>
                        <div className="text-4xl font-black text-slate-900">5</div>
                        <div className="text-slate-400 text-sm mt-2">Kogu võrgustik</div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 font-medium mb-2">Vastamismäär</div>
                        <div className="text-4xl font-black text-slate-900">~94%</div>
                        <div className="text-emerald-500 text-sm font-bold mt-2">Väga hea</div>
                    </div>
                </div>

                {/* STORE TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-800">Kaupluste Tegevuslogi</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-4 font-bold">Linn</th>
                                    <th className="px-8 py-4 font-bold">Kauplus</th>
                                    <th className="px-8 py-4 font-bold text-right">Päringuid</th>
                                    <th className="px-8 py-4 font-bold text-right">Viimati</th>
                                    <th className="px-8 py-4 font-bold text-right">Staatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {STATS.map((store) => (
                                    <tr key={store.city} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5 font-bold">{store.city}</td>
                                        <td className="px-8 py-5">{store.storeName}</td>
                                        <td className="px-8 py-5 text-right font-mono text-lg">{store.rfqs}</td>
                                        <td className="px-8 py-5 text-right text-slate-500">{store.lastRfq}</td>
                                        <td className="px-8 py-5 text-right">
                                            {store.status === 'ACTIVE' && (
                                                <span className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    AKTIIVNE
                                                </span>
                                            )}
                                            {store.status === 'LOW' && (
                                                <span className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    VÄHE TEGEVUST
                                                </span>
                                            )}
                                            {store.status === 'INACTIVE' && (
                                                <span className="inline-flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    MITTEAKTIIVNE
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-400 text-sm">
                    <p>SmartBuild Systems © 2026. Konfidentsiaalne.</p>
                </div>
            </main>
        </div>
    );
}

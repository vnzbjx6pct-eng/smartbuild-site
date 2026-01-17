"use client";

import { useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Building2,
    CheckCircle2,
    Globe,
    TrendingUp,
    Users,
    ShieldAlert,
    Clock
} from "lucide-react";

// --- MOCK DATA GENERATION (Simulating Database Aggregation) ---

type CityStat = {
    name: string;
    rfqCount: number;
    partnersActive: number;
    managersActive: number;
    health: 'GOOD' | 'WARNING' | 'CRITICAL';
    fallbackRate: number; // % of RFQs going to generic email
};

type PartnerStat = {
    name: string;
    cityCoverage: number;
    managerCount: number;
    rfqReceived: number;
    lastActivity: string;
    healthScore: number; // 0-100
};

type Alert = {
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    date: string;
};

// Mocked Snapshot Data
const KPI_STATS = {
    totalRfqs7d: 142,
    totalRfqs30d: 589,
    assignedRate: 98.2, // %
    responseRateApprox: 76, // %
    activeCities: 4
};

const CITY_STATS: CityStat[] = [
    { name: 'Tallinn', rfqCount: 312, partnersActive: 4, managersActive: 12, health: 'GOOD', fallbackRate: 2 },
    { name: 'Tartu', rfqCount: 156, partnersActive: 3, managersActive: 8, health: 'GOOD', fallbackRate: 5 },
    { name: 'Pärnu', rfqCount: 98, partnersActive: 2, managersActive: 5, health: 'WARNING', fallbackRate: 15 },
    { name: 'Narva', rfqCount: 23, partnersActive: 1, managersActive: 1, health: 'CRITICAL', fallbackRate: 45 },
];

const PARTNER_STATS: PartnerStat[] = [
    { name: 'Espak', cityCoverage: 4, managerCount: 15, rfqReceived: 210, lastActivity: '2 min tagasi', healthScore: 98 },
    { name: 'Bauhof', cityCoverage: 3, managerCount: 8, rfqReceived: 145, lastActivity: '15 min tagasi', healthScore: 92 },
    { name: 'Decora', cityCoverage: 2, managerCount: 4, rfqReceived: 89, lastActivity: '1 tund tagasi', healthScore: 85 },
    { name: 'Ehituse ABC', cityCoverage: 4, managerCount: 10, rfqReceived: 145, lastActivity: '4 tundi tagasi', healthScore: 88 },
];

const ALERTS: Alert[] = [
    { id: '1', type: 'CRITICAL', message: 'Narva: Fallback email usage > 40% (Manager shortage)', date: 'Täna 10:00' },
    { id: '2', type: 'WARNING', message: 'Pärnu: High load on Manager "Tiit Kask" (>20 leads/day)', date: 'Eile 14:30' },
    { id: '3', type: 'INFO', message: 'New Partner "Karl Bilder" onboarding incomplete', date: '14.01.2026' },
];

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');

    return (
        <div className="space-y-8">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <BarChart3 size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{KPI_STATS.totalRfqs30d}</div>
                    <div className="text-sm text-slate-500">Päringut (30 päeva)</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{KPI_STATS.assignedRate}%</div>
                    <div className="text-sm text-slate-500">Edukas suunamine</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">~{KPI_STATS.responseRateApprox}%</div>
                    <div className="text-sm text-slate-500">Hinnanguline vastamismäär</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Globe size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Eesti</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{KPI_STATS.activeCities}</div>
                    <div className="text-sm text-slate-500">Aktiivset linna</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: ALERTS & CITIES */}
                <div className="lg:col-span-2 space-y-8">

                    {/* RED FLAGS */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ShieldAlert size={18} className="text-red-500" />
                                Kriitilised Teated (Red Flags)
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {ALERTS.map(alert => (
                                <div key={alert.id} className="p-4 flex gap-4 items-start hover:bg-slate-50">
                                    <div className={`mt-1 p-1.5 rounded-full shrink-0 ${alert.type === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                            alert.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{alert.message}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> {alert.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CITY PERFORMANCE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Globe size={18} className="text-slate-400" />
                                Linnade Tervis
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Linn</th>
                                        <th className="px-6 py-3 font-medium">RFQs (30p)</th>
                                        <th className="px-6 py-3 font-medium">Partnerid</th>
                                        <th className="px-6 py-3 font-medium">Müügijuhid</th>
                                        <th className="px-6 py-3 font-medium text-right">Fallback %</th>
                                        <th className="px-6 py-3 font-medium text-right">Staatus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {CITY_STATS.map(city => (
                                        <tr key={city.name} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-900">{city.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{city.rfqCount}</td>
                                            <td className="px-6 py-4 text-slate-600">{city.partnersActive}</td>
                                            <td className="px-6 py-4 text-slate-600">{city.managersActive}</td>
                                            <td className={`px-6 py-4 text-right font-mono ${city.fallbackRate > 20 ? 'text-red-600 font-bold' : 'text-slate-500'
                                                }`}>{city.fallbackRate}%</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-block w-3 h-3 rounded-full ${city.health === 'GOOD' ? 'bg-emerald-500' :
                                                        city.health === 'WARNING' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                                                    }`}></span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: PARTNERS */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Building2 size={18} className="text-slate-400" />
                                Partnerite Edetabel
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {PARTNER_STATS.map((partner, idx) => (
                                <div key={partner.name} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                                <span className="text-slate-400 font-normal text-xs">#{idx + 1}</span>
                                                {partner.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {partner.cityCoverage} linna • {partner.managerCount} müügijuhti
                                            </div>
                                        </div>
                                        <div className={`text-xl font-black ${partner.healthScore >= 90 ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {partner.healthScore}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-xs text-slate-400">
                                            Viimati: {partner.lastActivity}
                                        </div>
                                        <div className="text-sm font-bold text-slate-700">
                                            {partner.rfqReceived} <span className="text-slate-400 font-normal text-xs">päringut</span>
                                        </div>
                                    </div>

                                    {/* Mini Activity Bar */}
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="bg-slate-800 h-full rounded-full"
                                            style={{ width: `${(partner.rfqReceived / 250) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

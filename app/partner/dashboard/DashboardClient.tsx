"use client";

import { useState } from "react";
import {
    Users,
    FileText,
    TrendingUp,
    MapPin,
    CheckCircle2,
    AlertCircle,
    PauseCircle,
    PlayCircle,
    Search
} from "lucide-react";

// --- MOCKED DATA TYPES ---

type Manager = {
    id: string;
    name: string;
    email: string;
    city: string;
    status: 'ACTIVE' | 'PAUSED';
    leadsCount: number;
    lastActive: string;
};

type Lead = {
    id: string;
    date: string;
    city: string;
    customerType: 'B2C' | 'B2B';
    productCount: number;
    summary: string;
    assignedTo: string; // Manager Name
    status: 'NEW' | 'OPEN' | 'WON' | 'LOST';
};

// --- MOCKED INITIAL STATE (Simulation of DB) ---

const INITIAL_MANAGERS: Manager[] = [
    { id: '1', name: 'Tiit Kask', email: 'tiit@espak.ee', city: 'Pärnu', status: 'ACTIVE', leadsCount: 142, lastActive: '10 min tagasi' },
    { id: '2', name: 'Leida Pärn', email: 'leida@espak.ee', city: 'Pärnu', status: 'ACTIVE', leadsCount: 138, lastActive: '2 min tagasi' },
    { id: '3', name: 'Mart Mets', email: 'mart@espak.ee', city: 'Tallinn', status: 'PAUSED', leadsCount: 89, lastActive: '2 päeva tagasi' },
    { id: '4', name: 'Anna Tamm', email: 'anna@espak.ee', city: 'Tallinn', status: 'ACTIVE', leadsCount: 201, lastActive: 'Nüüd' },
];

const INITIAL_LEADS: Lead[] = [
    { id: 'L-2024-001', date: '16.01.2026', city: 'Pärnu', customerType: 'B2B', productCount: 45, summary: 'Fibo plokid + armatuur', assignedTo: 'Tiit Kask', status: 'NEW' },
    { id: 'L-2024-002', date: '16.01.2026', city: 'Tallinn', customerType: 'B2C', productCount: 12, summary: 'Vannitoa plaadid', assignedTo: 'Anna Tamm', status: 'OPEN' },
    { id: 'L-2024-003', date: '15.01.2026', city: 'Pärnu', customerType: 'B2B', productCount: 120, summary: 'Katusetarvikud (Suur)', assignedTo: 'Leida Pärn', status: 'WON' },
    { id: 'L-2024-004', date: '15.01.2026', city: 'Tallinn', customerType: 'B2C', productCount: 5, summary: 'Värvid ja pintslid', assignedTo: 'Anna Tamm', status: 'LOST' },
    { id: 'L-2024-005', date: '14.01.2026', city: 'Pärnu', customerType: 'B2B', productCount: 30, summary: 'Soojustusvill', assignedTo: 'Tiit Kask', status: 'WON' },
];

export default function DashboardClient() {
    const [managers, setManagers] = useState<Manager[]>(INITIAL_MANAGERS);
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
    const [filterCity, setFilterCity] = useState<string>('all');

    const toggleManagerStatus = (id: string) => {
        setManagers(prev => prev.map(m =>
            m.id === id
                ? { ...m, status: m.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
                : m
        ));
    };

    const activeManagersCount = managers.filter(m => m.status === 'ACTIVE').length;
    const totalLeadsToday = leads.filter(l => l.date === '16.01.2026').length;

    const filteredLeads = filterCity === 'all' ? leads : leads.filter(l => l.city.toLowerCase() === filterCity.toLowerCase());
    const filteredManagers = filterCity === 'all' ? managers : managers.filter(m => m.city.toLowerCase() === filterCity.toLowerCase());

    return (
        <div className="space-y-8">
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{totalLeadsToday}</div>
                        <div className="text-sm text-slate-500">Uut päringut täna</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{activeManagersCount} / {managers.length}</div>
                        <div className="text-sm text-slate-500">Müügijuhti aktiivsed</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">42%</div>
                        <div className="text-sm text-slate-500">B2B osakaal</div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterCity('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCity === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    Kõik linnad
                </button>
                <button
                    onClick={() => setFilterCity('Tallinn')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCity === 'Tallinn' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    Tallinn
                </button>
                <button
                    onClick={() => setFilterCity('Pärnu')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCity === 'Pärnu' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    Pärnu
                </button>
            </div>

            {/* MANAGERS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users size={18} />
                        Müügimeeskond ja Staatus
                    </h3>
                    <div className="text-xs text-slate-400">
                        Automaatne tööjaotus (Round-Robin)
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nimi</th>
                                <th className="px-6 py-3 font-medium">Linn</th>
                                <th className="px-6 py-3 font-medium">Päringuid kokku</th>
                                <th className="px-6 py-3 font-medium">Staatus</th>
                                <th className="px-6 py-3 font-medium text-right">Tegevus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredManagers.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{m.name}</div>
                                        <div className="text-xs text-slate-500">{m.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs">
                                            <MapPin size={10} /> {m.city}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{m.leadsCount}</td>
                                    <td className="px-6 py-4">
                                        {m.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                AKTIIVNE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                PAUSIL
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleManagerStatus(m.id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${m.status === 'ACTIVE'
                                                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {m.status === 'ACTIVE' ? (
                                                <span className="flex items-center gap-1"><PauseCircle size={14} /> Pane pausile</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><PlayCircle size={14} /> Aktiveeri</span>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RECENT LEADS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} />
                        Viimased hinnapäringud
                    </h3>
                    <div className="relative">
                        <input
                            placeholder="Otsi..."
                            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 w-48"
                        />
                        <Search size={14} className="absolute left-2.5 top-1.5 text-slate-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Kuupäev</th>
                                <th className="px-6 py-3 font-medium">Linn</th>
                                <th className="px-6 py-3 font-medium">Klient</th>
                                <th className="px-6 py-3 font-medium">Sisu</th>
                                <th className="px-6 py-3 font-medium">Vastutaja</th>
                                <th className="px-6 py-3 font-medium text-right">Staatus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{lead.date}</td>
                                    <td className="px-6 py-4 text-slate-600">{lead.city}</td>
                                    <td className="px-6 py-4">
                                        {lead.customerType === 'B2B' ? (
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">ÄRIKLIENT</span>
                                        ) : (
                                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">ERAISIK</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                        {lead.summary}
                                        <div className="text-xs text-slate-400">{lead.productCount} toodet</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {lead.assignedTo.substring(0, 1)}
                                        </div>
                                        {lead.assignedTo}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {lead.status === 'NEW' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">UUS</span>}
                                        {lead.status === 'OPEN' && <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">TÖÖS</span>}
                                        {lead.status === 'WON' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">MÜÜDUD</span>}
                                        {lead.status === 'LOST' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">LOOBUD</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center text-xs text-slate-400 mt-8">
                Andmed uuenevad reaalajas. Viimane sünkroniseerimine: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}

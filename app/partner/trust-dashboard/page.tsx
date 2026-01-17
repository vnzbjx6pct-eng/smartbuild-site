import { ArrowUpRight, CheckCircle2, Clock, Users } from "lucide-react";

// Mock Data for "Demo Mode"
const DEMO_METRICS = {
    totalRfqs: 142,
    completionRate: 98,
    avgResponseTime: "45 min",
    activeManagers: 12
};

const DEMO_MANAGERS = [
    { name: "Toomas K.", store: "Espak Tartu", role: "Tartu Region", rfqs: 45, lastActive: "12 min ago", status: "Healthy" },
    { name: "Liis M.", store: "Espak Tallinn", role: "Tallinn Key Account", rfqs: 52, lastActive: "5 min ago", status: "Healthy" },
    { name: "Andres V.", store: "Espak Pärnu", role: "Pärnu Manager", rfqs: 31, lastActive: "2h ago", status: "Attention" },
    { name: "Mart T.", store: "Espak Viljandi", role: "Viljandi Sales", rfqs: 14, lastActive: "1d ago", status: "Healthy" },
];

const DEMO_CITIES = [
    { name: "Tallinn", volume: 45, trend: "+12%" },
    { name: "Tartu", volume: 30, trend: "+8%" },
    { name: "Pärnu", volume: 15, trend: "+2%" },
    { name: "Viljandi", volume: 10, trend: "0%" },
];

export default function TrustDashboardPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            {/* Executive Header */}
            <header className="border-b border-slate-800 bg-[#0f172a]/50">
                <div className="container mx-auto px-6 py-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-emerald-500/20">
                                Live System Status
                            </span>
                            <span className="text-slate-500 text-xs font-mono">ID: SB-TRUST-8821</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Partner Trust Center</h1>
                        <p className="text-slate-400 text-sm">Real-time routing transparency & load distribution monitoring.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Current SLA Status</p>
                        <p className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-4 h-4" />
                            98.2% Healthy
                        </p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 space-y-8">

                {/* 1. KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total RFQs (30d)"
                        value={DEMO_METRICS.totalRfqs}
                        trend="+18%"
                        icon={<ArrowUpRight className="w-5 h-5 text-blue-400" />}
                    />
                    <MetricCard
                        title="Success Rate"
                        value={`${DEMO_METRICS.completionRate}%`}
                        sub="Delivery Confirmed"
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    />
                    <MetricCard
                        title="Avg Response"
                        value={DEMO_METRICS.avgResponseTime}
                        sub="Under 1h Target"
                        icon={<Clock className="w-5 h-5 text-amber-400" />}
                    />
                    <MetricCard
                        title="Active Managers"
                        value={DEMO_METRICS.activeManagers}
                        sub="Load Balanced"
                        icon={<Users className="w-5 h-5 text-indigo-400" />}
                    />
                </div>

                {/* 2. Manager Distribution Logic */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Table: Manager Load */}
                    <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">Manager Load Distribution</h3>
                                <p className="text-xs text-slate-400">Proving fair RFQ routing across your sales team.</p>
                            </div>
                            <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">
                                Export Report
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Manager</th>
                                        <th className="px-6 py-3">Role / Region</th>
                                        <th className="px-6 py-3 text-right">RFQs Received</th>
                                        <th className="px-6 py-3">Last Active</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {DEMO_MANAGERS.map((m, i) => (
                                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{m.name}</td>
                                            <td className="px-6 py-4 text-slate-400">{m.role}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-200">{m.rfqs}</td>
                                            <td className="px-6 py-4 text-slate-500">{m.lastActive}</td>
                                            <td className="px-6 py-4">
                                                <Badge status={m.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Side Panel: Geographic Split */}
                    <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-6">
                        <h3 className="font-bold text-white mb-4">Volume by City</h3>
                        <div className="space-y-4">
                            {DEMO_CITIES.map((c, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition" />
                                        <span className="text-slate-300 text-sm">{c.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-xs">{c.trend}</span>
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${c.volume}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">System Health</h4>
                            <div className="space-y-2">
                                <HealthRow label="Email Gateway" status="Operational" />
                                <HealthRow label="SMS Notifier" status="Operational" />
                                <HealthRow label="Database Sync" status="Operational" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Sub-components for cleanliness
function MetricCard({ title, value, sub, trend, icon }: any) {
    return (
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
                {trend && <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">{trend}</span>}
            </div>
            <div>
                <p className="text-slate-400 text-xs uppercase font-semibold">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {sub && <span className="text-xs text-slate-500">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    if (status === "Healthy") {
        return <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Healthy</span>;
    }
    return <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">Check</span>;
}

function HealthRow({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {status}
            </span>
        </div>
    );
}

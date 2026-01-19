"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { isPartner } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

import {
    LayoutDashboard,
    Upload,
    FileSpreadsheet,
    ListFilter,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    Lock,
    Boxes
} from "lucide-react";
import Link from "next/link";
import { savePartnerProducts, getPartnerProducts } from "@/app/actions/partner";
import { normalizeCsvRow, type PartnerProductDraft, type CsvRowError } from "@/app/lib/partner/csv";

interface PartnerProduct {
    id: string;
    product_name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
}

export default function PartnerDashboardPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
    const [dbProducts, setDbProducts] = useState<PartnerProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Fetch products - Hoisted
    const loadProducts = useCallback(async () => {
        try {
            const result = await getPartnerProducts();
            if (result.success && result.data) {
                setDbProducts(result.data);
            } else {
                console.error("Failed to load products:", result.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login?next=/account/partner");
                return;
            }

            const authorized = await isPartner(session.user, supabase);
            setAuthStatus(authorized ? 'authorized' : 'denied');
        };
        checkAccess();
    }, [router, supabase]);

    // Dashboard State
    const [activeTab, setActiveTab] = useState<'overview' | 'import' | 'products'>('import');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<PartnerProductDraft[]>([]);
    const [allData, setAllData] = useState<PartnerProductDraft[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Load on tab change
    useEffect(() => {
        if (activeTab === 'products' && authStatus === 'authorized') {
            loadProducts();
        }
    }, [activeTab, authStatus, loadProducts]);

    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (authStatus === 'denied') {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-8">
                        You do not have the required Partner permissions to access this dashboard.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/partners"
                            className="block w-full px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Become a Partner
                        </Link>
                        <Link
                            href="/account"
                            className="block w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Back to My Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Strict CSV Parser
    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        const validRows: PartnerProductDraft[] = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const currentline = lines[i].split(',');
            const rawObj: Record<string, string> = {};

            headers.forEach((header, index) => {
                if (currentline[index] !== undefined) {
                    rawObj[header] = currentline[index].trim();
                }
            });

            const { value } = normalizeCsvRow(rawObj, i);
            if (value) {
                validRows.push(value);
            }
        }
        return { validRows };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setUploadStatus('idle');

            const text = await f.text();
            const { validRows } = parseCSV(text);

            setAllData(validRows);
            setPreview(validRows.slice(0, 5));
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        try {
            const result = await savePartnerProducts(allData);

            if (result.success) {
                setUploadStatus('success');
                setFile(null);
                setPreview([]);
                setAllData([]);
                // Optionally reload products if we switch tabs or show count
            } else {
                setUploadStatus('error');
                console.error("Upload failed", result.error);
            }
        } catch (e) {
            console.error(e);
            setUploadStatus('error');
        }
        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                    SB
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">Partner Portal</h2>
                                    <p className="text-xs text-slate-500">My Store</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('import')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'import' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Upload size={18} />
                                    <span className="font-medium">Import Products</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('products');
                                        if (authStatus === 'authorized') setLoadingProducts(true);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <ListFilter size={18} />
                                    <span className="font-medium">My Products</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">

                        {activeTab === 'import' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Import Products</h1>
                                <p className="text-slate-500 mb-8">Upload your product catalog in CSV format. We will validate and sync it with SmartBuild.</p>

                                {/* File Drop */}
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-orange-400 hover:bg-orange-50 transition-all group">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-colors">
                                        <FileSpreadsheet className="text-blue-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Click to upload CSV</h3>
                                    <p className="text-slate-400 text-sm mb-6">or drag and drop file here</p>
                                    <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500">
                                        product_name, category, price, stock, delivery_days
                                    </div>
                                </div>

                                {/* Preview */}
                                {file && (
                                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <CheckCircle2 size={18} className="text-green-500" />
                                                Preview: {file.name}
                                            </h3>
                                            <span className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>

                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                                    <tr>
                                                        {preview[0] && Object.keys(preview[0]).map((key) => (
                                                            <th key={key} className="px-4 py-3 whitespace-nowrap">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.map((row, i: number) => (
                                                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                            {Object.values(row).map((val, j) => (
                                                                <td key={j} className="px-4 py-3 text-slate-700 whitespace-nowrap">{String(val)}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70"
                                            >
                                                {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                                                {uploading ? 'Importing...' : 'Confirm Import'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {uploadStatus === 'success' && !file && (
                                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
                                        <CheckCircle2 size={20} />
                                        <div className="font-medium">Import successful! Products are being processed.</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard title="Total Products" value="1,248" icon={Boxes} color="bg-blue-50 text-blue-600" />
                                    <StatCard title="Active Orders" value="12" icon={Boxes} color="bg-orange-50 text-orange-600" />
                                    <StatCard title="Revenue (MTD)" value="€8,420" icon={ListFilter} color="bg-green-50 text-green-600" />
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center py-20">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="text-slate-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No recent alerts</h3>
                                    <p className="text-slate-500">Your integration is running smoothly.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Search..." />
                                    </div>
                                </div>
                                {loadingProducts ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Loading products...
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3">Product Name</th>
                                                    <th className="px-4 py-3">Category</th>
                                                    <th className="px-4 py-3">Price</th>
                                                    <th className="px-4 py-3">Stock</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dbProducts.map((p) => (
                                                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-900">{p.product_name}</td>
                                                        <td className="px-4 py-3 text-slate-500">{p.category}</td>
                                                        <td className="px-4 py-3 text-slate-900">€{p.price}</td>
                                                        <td className="px-4 py-3 text-slate-500">{p.stock}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {dbProducts.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-8 text-slate-500">
                                                            No products found. Import some using the Import tab.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
}

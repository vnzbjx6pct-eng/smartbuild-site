'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit, Package, AlertCircle, Beaker } from 'lucide-react';
import { createProduct } from '@/app/actions/partner';
import type { Product } from '@/app/actions/partner';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import DeleteProductButton from './DeleteProductButton';

interface ProductTableProps {
    initialProducts: Product[];
}

export default function ProductTable({ initialProducts }: ProductTableProps) {
    const [products] = useState<Product[]>(initialProducts); // In real app, might want to sync with server or use router refresh
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Categories for filter
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, categoryFilter]);

    // Handle successful create/update
    // For MVP we just refresh the whole page or we could optimistically update. 
    // To keep it simple and consistent with server actions cache revalidation:
    const handleSuccess = () => {
        // Option A: router.refresh() if using Next.js caching properly
        // Option B: Just reload window (simple)
        window.location.reload();
    };

    const handleCreateTestProduct = async () => {
        const formData = new FormData();
        const uniqueId = Math.random().toString(36).substring(7);
        formData.append('name', `Test Toode ${uniqueId}`);
        formData.append('description', 'Automaatselt loodud testtoode');
        formData.append('price', (Math.random() * 100).toFixed(2));
        formData.append('stock', '10');
        formData.append('unit', 'tk');
        formData.append('category', 'Test');
        formData.append('sku', `TEST-${uniqueId.toUpperCase()}`);

        const toastId = toast.loading('Loon testtoodet...');
        try {
            const res = await createProduct(formData);
            if (res.success) {
                toast.success('Testtoode loodud', { id: toastId });
                window.location.reload();
            } else {
                toast.error(res.error || 'Viga loomisel', { id: toastId });
            }
        } catch {
            toast.error('Võrgu viga', { id: toastId });
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-1 gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Otsi nime või koodi järgi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        />
                    </div>
                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none cursor-pointer"
                        >
                            <option value="all">Kõik kategooriad</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreateTestProduct}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors shadow-sm whitespace-nowrap"
                        title="Lisa kiire testtoode"
                    >
                        <Beaker size={20} /> <span className="hidden sm:inline">Test</span>
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={20} /> Lisa toode
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Toode</th>
                                <th className="px-6 py-4">Kategooria</th>
                                <th className="px-6 py-4">Hind</th>
                                <th className="px-6 py-4">Laoseis</th>
                                <th className="px-6 py-4 text-right">Tegevused</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {product.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900">{product.name}</div>
                                                    <div className="text-xs text-slate-500">{product.sku || 'Kood puudub'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {product.category || 'Määramata'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                            {Number(product.price).toFixed(2)} €
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {product.stock} {product.unit}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Muuda"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <DeleteProductButton productId={product.id} productName={product.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={32} className="text-slate-300" />
                                            <p>Tooteid ei leitud</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer / Pagination placeholder */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex justify-between items-center">
                    <span>Kokku {filteredProducts.length} toodet</span>
                    {/* Pagination logic would go here */}
                </div>
            </div>

            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                product={editingProduct}
                onSuccess={handleSuccess}
            />
        </div >
    );
}

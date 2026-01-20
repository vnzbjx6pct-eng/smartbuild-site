'use client';

import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import type { Product } from '@/app/actions/partner';
import { createProduct, updateProduct } from '@/app/actions/partner';
import toast from 'react-hot-toast';
import ProductImageUpload from './ProductImageUpload';

interface ProductFormProps {
    product?: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormDataState {
    name: string;
    description: string;
    price: string;
    category: string;
    subcategory: string;
    sku: string;
    ean: string;
    unit: string;
    stock: string;
    image_url: string | null;
    delivery_days: string;
}

const INITIAL_STATE: FormDataState = {
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    sku: '',
    ean: '',
    unit: 'tk',
    stock: '0',
    image_url: null,
    delivery_days: ''
};

export default function ProductForm({ product, isOpen, onClose, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormDataState>(
        product ? {
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category || '',
            subcategory: product.subcategory || '',
            sku: product.sku || '',
            ean: product.ean || '',
            unit: product.unit || 'tk',
            stock: product.stock.toString(),
            image_url: product.image_url,
            delivery_days: product.delivery_days?.toString() || ''
        } : INITIAL_STATE
    );

    const handleChange = (field: keyof FormDataState, value: string | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                data.append(key, value);
            }
        });

        try {
            const res = product
                ? await updateProduct(product.id, data)
                : await createProduct(data);

            if (res.success) {
                toast.success(product ? "Toode uuendatud" : "Toode loodud");
                onSuccess();
                onClose();
                if (!product) setFormData(INITIAL_STATE); // Reset if create
            } else {
                toast.error(res.error || "Viga salvestamisel");
            }
        } catch (error) {
            toast.error("Võrgu viga");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">
                            {product ? "Muuda toodet" : "Lisa uus toode"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Põhiinfo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nimetus <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="nt. Kipsplaat Knauf White"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Hind (€) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => handleChange('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Ühik <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={e => handleChange('unit', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="tk">tk</option>
                                        <option value="m2">m2</option>
                                        <option value="pak">pak</option>
                                        <option value="jm">jm</option>
                                        <option value="kg">kg</option>
                                        <option value="L">l</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kirjeldus</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailid</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategooria</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={e => handleChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="nt. Üldehitus"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamkategooria</label>
                                    <input
                                        type="text"
                                        value={formData.subcategory}
                                        onChange={e => handleChange('subcategory', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Tootekood)</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={e => handleChange('sku', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">EAN (Triipkood)</label>
                                    <input
                                        type="text"
                                        value={formData.ean}
                                        onChange={e => handleChange('ean', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Logistics */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ladu ja Transport</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Laoseis</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={e => handleChange('stock', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tarneaeg (päevades)</label>
                                    <input
                                        type="number"
                                        value={formData.delivery_days}
                                        onChange={e => handleChange('delivery_days', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="nt. 2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Meedia</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Toote pilt</label>
                                <ProductImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => handleChange('image_url', url)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Loobu
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Salvesta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

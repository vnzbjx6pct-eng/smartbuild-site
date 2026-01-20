'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteProduct } from '@/app/actions/partner';
import toast from 'react-hot-toast';

interface DeleteProductButtonProps {
    productId: string;
    productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await deleteProduct(productId);
            if (res.success) {
                toast.success("Toode kustutatud");
                setIsOpen(false);
            } else {
                toast.error(res.error || "Viga kustutamisel");
            }
        } catch (e) {
            toast.error("Võrgu viga");
        } finally {
            setLoading(false);
        }
    };

    if (isOpen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Kustuta toode?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Oled kindel, et soovid kustutada toote <strong>&quot;{productName}&quot;</strong>? Seda tegevust ei saa tagasi võtta.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Katkesta
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Kustuta"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Kustuta"
        >
            <Trash2 size={18} />
        </button>
    );
}

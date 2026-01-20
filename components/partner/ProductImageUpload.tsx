'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadProductImage } from '@/app/actions/partner';
import toast from 'react-hot-toast';

interface ProductImageUploadProps {
    value?: string | null;
    onChange: (url: string | null) => void;
}

export default function ProductImageUpload({ value, onChange }: ProductImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // Client-side validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Fail on liiga suur (max 5MB)");
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error("Vale failiformaat. Lubatud: JPG, PNG, WEBP");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadProductImage(formData);
            if (res.success && res.data) {
                onChange(res.data);
                toast.success("Pilt üles laetud");
            } else {
                toast.error(res.error || "Viga üleslaadimisel");
            }
        } catch {
            toast.error("Võrgu viga");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    if (value) {
        return (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Toote pilt" className="w-full h-full object-cover" />
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`w-32 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'bg-slate-50 border-slate-300' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'}`}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
                disabled={uploading}
            />
            {uploading ? (
                <Loader2 className="animate-spin text-emerald-500" size={24} />
            ) : (
                <>
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-xs text-slate-500 text-center px-2">
                        Lae pilt <br /> (max 5MB)
                    </span>
                </>
            )}
        </div>
    );
}

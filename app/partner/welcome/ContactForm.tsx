"use client";

import { useState } from "react";

export default function PartnerContactForm() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('LOADING');
        // Simulate API call
        setTimeout(() => {
            setStatus('SUCCESS');
        }, 1500);
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Täname huvist!</h3>
                <p className="text-slate-600">
                    Sinu andmed on edastatud. Meie tiim võtab ühendust 1 tööpäeva jooksul.
                </p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="mt-6 text-sm text-slate-500 hover:text-slate-700 underline"
                >
                    Saada uus päring
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ettevõtte nimi</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="nt. Ehitus ABC" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kontaktisik</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ees- ja perekonnanimi" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-post</label>
                    <input required type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="nimi@ettevote.ee" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Märkus (valikuline)</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Linnad, erisoovid..." />
                </div>
                <button
                    disabled={status === 'LOADING'}
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === 'LOADING' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saatmine...
                        </>
                    ) : (
                        'Alusta koostööd'
                    )}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                    See on mittekohustuslik päring.
                </p>
            </div>
        </form>
    );
}

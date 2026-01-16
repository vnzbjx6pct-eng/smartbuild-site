'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('Pärnu'); // Default to Pärnu as per initial focus
    const [companyName, setCompanyName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (data.user) {
                // 2. Create Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: email,
                        city: city,
                        company_name: companyName || null
                    });

                if (profileError) {
                    console.error('Profile creation failed:', profileError);
                    // Verify if it's strictly necessary to fail registration or just log it
                    // For now, let's treat it as a warning but proceed, or throw if critical
                }
            }

            alert('Konto loodud! Nüüd võite sisse logida.');
            router.push('/login');
        } catch (err: any) {
            setError('Viga registreerimisel: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-900">Loo konto</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-post <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parool <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Linn (Tarne ja päringud) <span className="text-red-500">*</span></label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="Pärnu">Pärnu</option>
                                <option value="Tallinn">Tallinn</option>
                                <option value="Tartu">Tartu</option>
                                <option value="Rakvere">Rakvere</option>
                                <option value="Viljandi">Viljandi</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Vali piirkond, kust soovid peamiselt pakkumisi küsida.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ettevõtte nimi (Valikuline)</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="nt. Ehitus OÜ"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Loomine...' : 'Loo konto'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Juba konto olemas?{' '}
                    <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                        Logi sisse
                    </Link>
                </p>
            </div>
        </div>
    );
}

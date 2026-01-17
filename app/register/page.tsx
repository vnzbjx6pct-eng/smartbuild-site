'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/auth/UserProvider';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { signInWithOAuth } from '../lib/supabaseClient';

export default function RegisterPage() {
    const { t } = useLanguage();
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('Pärnu');
    const [companyName, setCompanyName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simple Client-Side Persistence (No Password)
            await login({
                email,
                city,
                name: companyName // using company name as name identifier for now, or just leave empty
            });

            alert('Andmed salvestatud! Teid tuvastatakse nüüd automaatselt.');
            router.push('/'); // Redirect to home or logic
        } catch (err: any) {
            setError('Viga salvestamisel: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-900">{(t as any).auth?.register || "Seadista profiil"}</h1>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => signInWithOAuth('google')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {(t as any).auth?.continue_with_google || "Jätka Google’iga"}
                    </button>
                    {/* Facebook and Apple skipped for brevity in Register to avoid overwhelming wall of text, or should I add them? 
                        USER asked for consistency. Let's add them.
                     */}
                    <button
                        onClick={() => signInWithOAuth('facebook')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.581c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.922h5.083l-1.109 3.667h-3.974v7.98h-5.026z" />
                        </svg>
                        {(t as any).auth?.continue_with_facebook || "Jätka Facebook’iga"}
                    </button>
                    <button
                        onClick={() => signInWithOAuth('apple')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.027-3.04 2.48-4.508 2.597-4.598-1.429-2.09-3.623-2.324-4.403-2.363-2-.08-3.675 1.04-4.61 1.04zm4.961-4.47c.546 1.052.701 2.325.701 3.597 1.182.027 2.455-.494 3.013-1.48.559-1.027.676-2.287.676-3.443-1.324.013-2.52.545-3.091 1.325z" />
                        </svg>
                        {(t as any).auth?.continue_with_apple || "Jätka Apple’iga"}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">
                            {(t as any).auth?.or_email || "või e-postiga"}
                        </span>
                    </div>
                </div>

                <p className="text-center text-slate-500 mb-6 text-sm">Salvestame teie e-posti ja linna, et te ei peaks neid igakord uuesti sisestama.</p>

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
                    {/* Password removed - No DB auth */}

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Linn (Tarne ja päringud) <span className="text-red-500">*</span></label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                {['Pärnu', 'Tallinn', 'Tartu', 'Rakvere', 'Viljandi'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ettevõtte nimi / Nimi</label>
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
                        {loading ? 'Salvestamine...' : 'Salvesta andmed'}
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

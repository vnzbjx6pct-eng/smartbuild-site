import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useUser } from "@/components/auth/UserProvider";
import { useState } from "react";

// Simplified Dialog Stub (In case user doesn't have shadcn Dialog ready, I'll build a custom overlay)
// But I should check if there are UI components.
// For now, I'll build a manual modal to be safe and dependency-free.

export default function SocialLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { t } = useLanguage();
    const { loginWithSocial, login } = useUser();
    const [loading, setLoading] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleSocial = async (provider: "google" | "facebook" | "apple") => {
        setLoading(provider);
        await loginWithSocial(provider);
        setLoading(null);
        onClose();
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setEmailError(t.validation.email_invalid);
            return;
        }
        setLoading("email");
        // Demo Email Login
        await login({ email: email });
        setLoading(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>

            {/* Content */}
            <div className="relative bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{t.common.login}</h2>
                    <p className="text-sm text-slate-400">{t.auth.login_to_continue}</p>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Google */}
                    <button
                        onClick={() => handleSocial("google")}
                        disabled={!!loading}
                        className="group flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading === "google" ? (
                            <span className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        )}
                        <span>{t.auth.continue_with_google}</span>
                    </button>

                    {/* Facebook - Improved Blue */}
                    <button
                        onClick={() => handleSocial("facebook")}
                        disabled={!!loading}
                        className="group flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#155fc0] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    >
                        {loading === "facebook" ? (
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9.993 11.968h2.097v8.941c4.542-.763 8-4.706 8-9.422 0-5.247-4.253-9.487-9.5-9.487S1.09 6.241 1.09 11.487c0 4.716 3.458 8.659 8 9.422V11.968H7v-2.909h2.097V7c0-2.483 1.055-4.09 3.656-5 0 0 .61-.16 2.61-.16v3h-1.397c-1.367 0-1.553.483-1.553 1.555V9.059h3.21l-.417 2.909H9.993v.001z" /></svg>
                        )}
                        <span>{t.auth.continue_with_facebook}</span>
                    </button>

                    {/* Apple - High Contrast (White on Black) */}
                    <button
                        onClick={() => handleSocial("apple")}
                        disabled={!!loading}
                        className="group flex items-center justify-center gap-3 bg-white text-black hover:bg-slate-200 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading === "apple" ? (
                            <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                        ) : (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.63 22.06c-1.74 0-2.98-1.07-5-1.07-2.07 0-2.95 1.04-4.8 1.04-1.95 0-3.95-1.87-5.38-4.55C-4.38 14.05.5 8.92 4.67 9.17c1.77.1 3.22 1.19 4.22 1.19 1 0 2.87-1.44 4.85-1.22 3.12.33 4.38 2.06 4.38 2.06s-2.43 1.34-2.18 4.38c.25 3.03 3.03 4.09 3.03 4.09s-1.09 2.68-2.68 5.6c-.79 1.44-2 3.22-3.66 3.22zM15.22 5.09c1.07-1.36 1.77-3.23 1.58-5.09-1.53.07-3.38 1.06-4.47 2.36-1.01 1.19-1.89 3.08-1.63 4.92 1.7.13 3.45-.83 4.52-2.19z" /></svg>
                        )}
                        <span>{t.auth.continue_with_apple}</span>
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-slate-500">{t.auth.or_email}</span></div>
                    </div>

                    {/* Email Login Form */}
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                placeholder="nimi@email.ee"
                                className={`w-full bg-slate-900 border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                            />
                            {emailError && <span className="absolute right-3 top-3.5 text-red-500 text-xs font-bold animate-pulse">!</span>}
                        </div>
                        {emailError && <p className="text-red-500 text-xs px-1">{emailError}</p>}

                        <button
                            type="submit"
                            disabled={!!loading}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl border border-slate-600 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading === "email" ? t.common.loading : t.common.login}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {t.auth.privacy_note}
                    </p>
                </div>
            </div>
        </div>
    );
}

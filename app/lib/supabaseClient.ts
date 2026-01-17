import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseKey;

// Robust client creation: if env vars are missing, return a mock client or a limited one.
// This prevents build/runtime crashes on Vercel if Supabase is not configured.

// Mock Supabase Client for "No-Backend" mode
const mockSupabase = {
    auth: {
        signInWithPassword: async () => ({ error: { message: "Sisselogimine pole hetkel aktiivne (Demo)" } }),
        signUp: async () => ({ error: { message: "Registreerimine pole hetkel aktiivne (Demo)" }, data: {} }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithOAuth: async () => ({ error: { message: "Demo režiim: OAuth pole seadistatud" } }),
    },
    from: () => ({
        insert: async () => ({ error: null }),
        select: async () => ({ data: [], error: null }),
    })
};

export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'smartbuild-auth',
        }
    })
    : (mockSupabase as any);

export async function signInWithOAuth(provider: 'google' | 'facebook' | 'apple') {
    if (isDemoMode) {
        // In demo mode, we simulate a delay then throw error or return mock
        await new Promise(r => setTimeout(r, 800));
        alert("Demo Mode: Social Login is not configured without env vars.");
        return { error: { message: "Demo Mode" } };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
    });
    return { data, error };
}

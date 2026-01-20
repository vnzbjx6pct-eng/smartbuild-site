
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Checks if the user has the 'partner' role.
 * Checks in order:
 * 1. app_metadata.role
 * 2. user_metadata.role
 * 3. profiles table (if needed and checking against DB is desired)
 * 
 * @param user The user object from Supabase auth
 * @param supabaseClient Optional supabase client for DB fallback check
 */
// Helper to check role string directly
export function isPartnerRole(role?: string | null): boolean {
    return role === 'partner';
}

/**
 * Checks if the user has the 'partner' role.
 * Now prioritizes checking the 'profiles' table if a Supabase client is provided.
 * 
 * @param user The user object (used for ID)
 * @param supabaseClient Supabase client for DB check
 */
export async function isPartner(user: User, supabaseClient?: SupabaseClient): Promise<boolean> {
    if (!user) return false;

    // 1. If client provided, check DB (Single Source of Truth)
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!error && data && isPartnerRole(data.role)) {
            return true;
        }
    }

    // 2. Fallback: Check metadata (legacy or if no client provided)
    // IMPORTANT: This should be avoided for critical checks, use DB where possible.
    if (user.app_metadata?.role === 'partner') return true;
    if (user.user_metadata?.role === 'partner') return true;

    return false;
}

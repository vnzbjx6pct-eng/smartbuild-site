
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
export async function isPartner(user: User, supabaseClient?: SupabaseClient): Promise<boolean> {
    if (!user) return false;

    // 1. Check app_metadata (secure, usually set by admin)
    if (user.app_metadata?.role === 'partner') return true;

    // 2. Check user_metadata (often used for quick prototyping, editable by user if not careful, but acceptable for first pass)
    if (user.user_metadata?.role === 'partner') return true;

    // 3. Fallback: Check profiles table if client is provided
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!error && data && data.role === 'partner') {
                return true;
            }
        } catch (err) {
            console.error('Error checking partner role in profiles:', err);
        }
    }

    return false;
}

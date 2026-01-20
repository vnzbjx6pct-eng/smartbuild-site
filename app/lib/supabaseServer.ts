import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Backward compatibility for API routes and analytics
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export const createClient = async () => {
    const cookieStore = await cookies();
    return createServerComponentClient({ cookies: () => Promise.resolve(cookieStore) });
};


import { NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase-server';

export async function GET() {
    const supabase = createServerClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, store_id')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        // Fallback or error if profile missing (should be created by trigger)
        // If profile is missing but user exists, we deny role access safely
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'profile_not_found' }, { status: 403 });
    }

    return NextResponse.json(profile);
}

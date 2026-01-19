import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Verify caller (Vercel Cron or Secret)
    const authHeader = req.headers.get('authorization');
    const cronHeader = req.headers.get('x-vercel-cron');
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    const isValidCron = cronHeader === '1';
    const isValidSecret = secret === process.env.CRON_SECRET;

    if (!isValidCron && !isValidSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Refresh Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });

        const { data, error } = await supabase.rpc('keepalive_ping');

        if (error) {
            console.error('Supabase KeepAlive Error:', error);
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            ts: new Date().toISOString(),
            data
        });

    } catch (err: any) {
        console.error('Cron Job Failed:', err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // Safety check for environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Missing Supabase environment variables - middleware disabled, skipping auth.')
        return res
    }

    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protect /account/partner and /partner routes
    if (req.nextUrl.pathname.startsWith('/account/partner') || req.nextUrl.pathname.startsWith('/partner')) {

        if (!session) {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/login'
            redirectUrl.searchParams.set('next', req.nextUrl.pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // Check Role via Profiles Table
        // We query the 'profiles' table directly to ensure we use valid DB data, not just metadata.
        // RLS ensures we can only read our own profile.
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        const isPartnerUser = !error && profile?.role === 'partner'

        if (!isPartnerUser) {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/account'
            // removing error param to keep it clean, or could keep it. 
            // User didn't strictly say to remove params, but /account is cleaner.
            // Let's keep the optional query param to be helpful but minimal.
            return NextResponse.redirect(redirectUrl)
        }
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isPublicPath = request.nextUrl.pathname.startsWith('/api/public') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname === '/favicon.ico'

    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Token: ${token ? 'Present' : 'Missing'}, Public: ${isPublicPath}`)

    // If trying to access login page while authenticated, redirect to dashboard
    if (isLoginPage && token) {
        console.log('[Middleware] Redirecting to dashboard')
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If trying to access protected route without token, redirect to login
    if (!token && !isLoginPage && !isPublicPath) {
        console.log('[Middleware] Redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes need to be accessible)
         * - api/public (public routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)',
    ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Verify token function using jose (Edge compatible)
async function verifyToken(token: string) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        await jwtVerify(token, secret)
        return true
    } catch (error) {
        console.error('[Middleware] Token verification failed:', error)
        return false
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'
    const isPublicPath = request.nextUrl.pathname.startsWith('/api/public') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname === '/favicon.ico'

    // console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Token: ${token ? 'Present' : 'Missing'}, Public: ${isPublicPath}`)

    // If trying to access login/register page while authenticated
    if (isAuthPage && token) {
        const isValid = await verifyToken(token)
        if (isValid) {
            console.log('[Middleware] Valid token on auth page, redirecting to dashboard')
            return NextResponse.redirect(new URL('/', request.url))
        } else {
            // Invalid token, let them stay on auth page but clear the cookie
            console.log('[Middleware] Invalid token on auth page, clearing cookie')
            const response = NextResponse.next()
            response.cookies.delete('token')
            return response
        }
    }

    // If trying to access protected route
    if (!isAuthPage && !isPublicPath) {
        if (!token) {
            console.log('[Middleware] No token, redirecting to login')
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Verify token validity
        const isValid = await verifyToken(token)
        if (!isValid) {
            console.log('[Middleware] Invalid token, redirecting to login')
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (all API routes should be handled by rewrites)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}

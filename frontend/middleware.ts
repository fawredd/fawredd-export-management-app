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
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isPublicPath = request.nextUrl.pathname.startsWith('/api/public') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname === '/favicon.ico'

    // console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Token: ${token ? 'Present' : 'Missing'}, Public: ${isPublicPath}`)

    // If trying to access login page while authenticated
    if (isLoginPage && token) {
        const isValid = await verifyToken(token)
        if (isValid) {
            console.log('[Middleware] Valid token on login page, redirecting to dashboard')
            return NextResponse.redirect(new URL('/', request.url))
        } else {
            // Invalid token, let them stay on login page but clear the cookie
            console.log('[Middleware] Invalid token on login page, clearing cookie')
            const response = NextResponse.next()
            response.cookies.delete('token')
            return response
        }
    }

    // If trying to access protected route
    if (!isLoginPage && !isPublicPath) {
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
         * - api/auth (auth routes need to be accessible)
         * - api/public (public routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)',
    ],
}

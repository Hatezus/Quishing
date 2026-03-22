import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

import { authRoutes, protectedRoutes, Routes } from '@/config/routes'

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl.origin
    const route = req.nextUrl.pathname

    const session = getSessionCookie(req)
    const isLoggedIn = !!session

    const userIsInAuthRoutes = authRoutes.includes(route)
    const userIsInProtectedRoutes = protectedRoutes.includes(route)

    if (userIsInAuthRoutes && isLoggedIn) {
        return NextResponse.redirect(new URL(url + Routes.profile), 302)
    }

    if (userIsInProtectedRoutes && !isLoggedIn) {
        return NextResponse.redirect(new URL(url + Routes.login), 302)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images|icons|manifest).*)',
    ],
}

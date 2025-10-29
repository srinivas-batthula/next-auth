// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

        // All protected routes...
const protectedPaths = ['/profile', '/chat'];

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    const isAuthenticated = !!token;
    const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
    // console.log("middleware: ", isAuthenticated);

    if (!isAuthenticated && isProtected) {
        const signInUrl = new URL('/login', req.url);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile', '/chat'],
};

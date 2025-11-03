import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    if (!sessionCookie) {
        if (pathname == "/login") {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Exclude API routes, static files, image optimizations, and .png files
        '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    ],
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect any route that contains /admin
  if (request.nextUrl.pathname.includes('/admin')) {
    // Check if user is logged in (mock auth cookie)
    const isLoggedIn = request.cookies.has('mock_auth');
    
    if (!isLoggedIn) {
      // Redirect to the central login portal if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;

  // Try to parse the token to check if user is authenticated
  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      isAuthenticated = parsedToken.state?.isAuthenticated || false;
    } catch {
      isAuthenticated = false;
    }
  }

  // If the user is not authenticated and tries to access protected routes
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and tries to access auth routes
  if (isAuthenticated && (
    request.nextUrl.pathname.startsWith('/admin/login') || 
    request.nextUrl.pathname.startsWith('/admin/register')
  )) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/login', '/admin/register'],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  let userRole = null;

  // Try to parse the token to check if user is authenticated and get role
  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      isAuthenticated = parsedToken.state?.isAuthenticated || false;
      userRole = parsedToken.state?.user?.role || null;
    } catch {
      isAuthenticated = false;
      userRole = null;
    }
  }

  const pathname = request.nextUrl.pathname;

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // Allow access to admin auth pages for unauthenticated users
    const isAdminAuthPage = pathname.startsWith('/admin/login') || 
                           pathname.startsWith('/admin/register') ||
                           pathname.startsWith('/admin/forgot-password') ||
                           pathname.startsWith('/admin/reset-password') ||
                           pathname.startsWith('/admin/verify-email');

    if (isAdminAuthPage) {
      // If user is authenticated admin, redirect away from auth pages
      if (isAuthenticated && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // If user is authenticated non-admin, redirect to learner area
      if (isAuthenticated && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Otherwise, allow access to auth pages
      return NextResponse.next();
    }

    // For non-auth admin pages, require authentication
    if (!isAuthenticated) {
      // Redirect unauthenticated users to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (userRole !== 'admin') {
      // Redirect non-admin users trying to access admin routes
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Learner portal protection
  if (pathname === '/portal') {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to learner login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (userRole !== 'learner') {
      // Redirect non-learner users trying to access learner portal
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Prevent authenticated users from accessing login/register pages
  if (isAuthenticated) {
    if (pathname === '/login' || pathname === '/register') {
      // Redirect based on user role
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (userRole === 'learner') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/portal', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
};
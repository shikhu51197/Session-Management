import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simplified middleware. 
  // In a real production app, we would verify the JWT here.
  // For this assignment, we'll demonstrate the logic of route protection.
  
  const userCookie = request.cookies.get('user');
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isCreatorRoute = path.startsWith('/dashboard/creator');
  const isUserRoute = path.startsWith('/dashboard/user');
  const isProfileRoute = path.startsWith('/profile');
  const isSessionDetailRoute = path.startsWith('/sessions/');
  const isAuthRoute = path.startsWith('/auth');

  // 1. Protection for unauthenticated users
  if ((isCreatorRoute || isUserRoute || isProfileRoute || isSessionDetailRoute) && !userCookie) {
    // Redirect to login page with error param if trying to access protected content while logged out
    return NextResponse.redirect(new URL('/auth/login?error=login_required', request.url));
  }

  // 2. Role-based protection for dashboards (for authenticated users)
  if (userCookie && (isCreatorRoute || isUserRoute)) {
    try {
      const user = JSON.parse(userCookie.value);
      
      if (isCreatorRoute && user.role !== 'CREATOR') {
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }

      if (isUserRoute && user.role !== 'USER') {
        return NextResponse.redirect(new URL('/dashboard/creator', request.url));
      }
    } catch (e) {
      // If cookie is invalid, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Redirect logged-in users away from auth pages
  if (isAuthRoute && userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      const dashboardPath = user.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/user';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch (e) {
      // If cookie is invalid, let them proceed to auth page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/profile/:path*', '/sessions/:path*'],
};

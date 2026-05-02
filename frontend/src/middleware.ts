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

  if (isCreatorRoute || isUserRoute) {
    if (!userCookie) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const user = JSON.parse(userCookie.value);
      
      if (isCreatorRoute && user.role !== 'CREATOR') {
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }

      if (isUserRoute && user.role !== 'USER') {
        return NextResponse.redirect(new URL('/dashboard/creator', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

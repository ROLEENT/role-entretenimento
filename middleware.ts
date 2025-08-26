import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return res;
  }

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      const supabase = createMiddlewareClient({ req: request, res });
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session found, redirecting to admin login');
        const redirectUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is admin by querying profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile?.is_admin) {
        console.log('User is not admin, redirecting to admin login');
        const redirectUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // User is authenticated and is admin, allow access
      return res;
    } catch (error) {
      console.error('Middleware error:', error);
      const redirectUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Check session
  const { data: { session } } = await supabase.auth.getSession()

  // Auth callback route - allow access
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Auth routes - redirect to chat if logged in
  if (
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/signup') ||
    request.nextUrl.pathname === '/'
  ) {
    if (session) {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
    return res
  }

  // Protected routes - redirect to login if not logged in
  if (
    request.nextUrl.pathname.startsWith('/chat') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/search')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return res
  }

  // Authenticated root route - redirect to chat
  if (request.nextUrl.pathname === '/authenticated') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/auth/:path*', '/chat/:path*', '/profile/:path*', '/search/:path*', '/authenticated']
} 
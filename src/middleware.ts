import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in and trying to access protected routes
  if (
    !session &&
    (request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/search'))
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If user is logged in and trying to access auth routes
  if (
    session &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/signup'))
  ) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // If user is logged in and accessing root, redirect to chat
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // If user is not logged in and accessing root, allow access
  if (!session && request.nextUrl.pathname === '/') {
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/chat/:path*',
    '/profile/:path*',
    '/search/:path*',
    '/auth/:path*',
  ],
} 
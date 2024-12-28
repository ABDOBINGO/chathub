import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle password reset flow
  if (request.nextUrl.pathname === '/') {
    const requestUrl = new URL(request.url)
    const token = requestUrl.searchParams.get('token')
    const type = requestUrl.searchParams.get('type')

    if (token && type === 'recovery') {
      // Redirect to update password page with the token
      return NextResponse.redirect(new URL('/auth/update-password', request.url))
    }
  }

  // Protected routes
  if (
    !session &&
    (request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/search'))
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Auth routes when already logged in
  if (
    session &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/signup'))
  ) {
    return NextResponse.redirect(new URL('/chat', request.url))
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
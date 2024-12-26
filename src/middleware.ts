import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // If the path is exactly /authenticated, redirect to /chat
  if (request.nextUrl.pathname === '/authenticated') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/authenticated'
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/chat'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // If there's an error, redirect to login with the error message
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error_description || 'An error occurred')}`,
        requestUrl.origin
      )
    )
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        throw exchangeError
      }

      // URL to redirect to after sign in process completes
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error: any) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(error.message || 'An error occurred during authentication')}`,
          requestUrl.origin
        )
      )
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 
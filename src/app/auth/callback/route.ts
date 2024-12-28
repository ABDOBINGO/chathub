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
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')

  // Create Supabase client
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // If there's an error, redirect to login with the error message
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error_description || 'An error occurred')}`,
        requestUrl.origin
      )
    )
  }

  try {
    // Handle recovery (password reset) flow
    if (token && type === 'recovery') {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (verifyError) {
        throw verifyError
      }

      return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin))
    }

    // Handle regular sign-in/sign-up flow
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        throw exchangeError
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message || 'An error occurred during authentication')}`,
        requestUrl.origin
      )
    )
  }

  // If no code or token, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 
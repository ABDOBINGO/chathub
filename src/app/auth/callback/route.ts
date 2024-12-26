import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()

    // If we already have a session, redirect to chat
    if (session) {
      return NextResponse.redirect(`${requestUrl.origin}/chat`)
    }

    // Get URL parameters
    const code = requestUrl.searchParams.get('code')
    const token = requestUrl.searchParams.get('token')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next')

    // Handle email verification
    if (token && type === 'signup') {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      })

      if (error) {
        console.error('Verification error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
        )
      }

      if (data.session) {
        // If verification was successful and we got a session, redirect to chat
        return NextResponse.redirect(`${requestUrl.origin}/chat`)
      }
    }

    // Handle OAuth or magic link sign-in
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
        )
      }

      if (data.session) {
        // If we got a session, redirect to chat or next URL
        return NextResponse.redirect(next ? `${requestUrl.origin}${next}` : `${requestUrl.origin}/chat`)
      }
    }

    // If we get here, redirect to login with a generic success message
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?message=${encodeURIComponent('Please sign in to continue.')}`
    )

  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message || 'An error occurred during authentication.')}`
    )
  }
} 
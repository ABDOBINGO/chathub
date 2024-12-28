import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/chat'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        throw exchangeError
      }

      // URL to redirect to after sign in process completes
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // If no code, redirect to login
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message || 'An error occurred during authentication')}`,
        request.url
      )
    )
  }
} 
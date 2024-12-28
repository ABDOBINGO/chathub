'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success('Check your email for the password reset link')
    } catch (error: any) {
      console.error('Error sending reset password email:', error)
      toast.error(error?.message || 'Failed to send reset password email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <Image
              src="/images/owl-happy.png"
              alt="Happy Owl"
              layout="fill"
              className="animate-bounce"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to {email}
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="relative w-24 h-24 mx-auto mb-8">
            <Image
              src={isFocused ? "/images/owl-looking.svg" : "/images/owl-neutral.svg"}
              alt="Owl mascot"
              width={96}
              height={96}
              className="transition-transform duration-300"
              style={{ transform: isFocused ? 'scale(1.1)' : 'scale(1)' }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a password reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform hover:shadow-lg"
              placeholder="Email address"
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send reset link'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
} 
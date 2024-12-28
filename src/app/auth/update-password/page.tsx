'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

function UpdatePasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check for error in URL parameters
    const error = searchParams.get('error_description')
    if (error) {
      toast.error(error)
      router.push('/auth/forgot-password')
      return
    }

    // Check for error in URL hash
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      const hashError = hashParams.get('error_description')
      if (hashError) {
        toast.error(hashError)
        router.push('/auth/forgot-password')
        return
      }
    }

    // Verify session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please request a new password reset link')
        router.push('/auth/forgot-password')
      }
    }
    checkSession()
  }, [searchParams, router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Password updated successfully')
      
      // Sign out the user and redirect to login
      await supabase.auth.signOut()
      router.push('/auth/login?message=Password updated successfully. Please log in with your new password.')
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="relative w-24 h-24 mx-auto mb-8">
            <Image
              src={isFocused ? "/images/owl-hiding.png" : "/images/owl-neutral.png"}
              alt="Owl mascot"
              layout="fill"
              className="transition-transform duration-300"
              style={{ transform: isFocused ? 'scale(1.1)' : 'scale(1)' }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Update your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform hover:shadow-lg"
                placeholder="New password"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform hover:shadow-lg"
                placeholder="Confirm new password"
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Update password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  )
} 
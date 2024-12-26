'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/chat')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the chat page</p>
      </div>
    </div>
  )
} 
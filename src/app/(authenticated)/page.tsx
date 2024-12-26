import { redirect } from 'next/navigation'

// Force static generation
export const dynamic = 'force-static'
export const revalidate = 0

export default function AuthenticatedPage() {
  try {
    // Attempt to redirect to chat
    return redirect('/chat')
  } catch (error) {
    // Fallback redirect using window.location if the redirect fails
    if (typeof window !== 'undefined') {
      window.location.href = '/chat'
    }
    
    // Return empty div as fallback
    return <div />
  }
} 
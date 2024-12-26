import { redirect } from 'next/navigation'

export const dynamic = 'force-static'

export default async function AuthenticatedPage() {
  redirect('/chat')
} 
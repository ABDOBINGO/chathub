'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/auth-context'
import { Message } from '@/types/chat'

interface SearchResult {
  id: string
  full_name: string
  avatar_url: string
  email: string
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${searchTerm}%`)
        .order('full_name')

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Search Users
        </h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : results.length > 0 ? (
          results.map((profile) => (
            <div
              key={profile.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}`}
                  alt={profile.full_name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile.full_name || 'Unnamed User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                </div>
              </div>
              {profile.id !== user.id && (
                <Link
                  href={`/chat/private?user=${profile.id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <FiMail className="w-4 h-4" />
                  <span>Message</span>
                </Link>
              )}
            </div>
          ))
        ) : searchTerm ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No users found matching "{searchTerm}"
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Start typing to search for users
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMessageSquare, FiUsers, FiMail, FiUser, FiSearch, FiLogOut } from 'react-icons/fi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [profile, setProfile] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  if (!user) return null

  const links = [
    { href: '/', label: 'Chat', icon: FiMessageSquare },
    { href: '/chat/groups', label: 'Groups', icon: FiUsers },
    { href: '/chat/private', label: 'Private Messages', icon: FiMail },
    { href: '/search', label: 'Search Users', icon: FiSearch },
    { href: '/profile', label: 'Profile', icon: FiUser },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:top-0 md:left-0 md:bottom-0 md:w-64 md:border-r md:border-t-0">
      <div className="flex flex-row md:flex-col items-center md:items-stretch h-16 md:h-screen p-4">
        {/* User Avatar - Only visible on desktop */}
        <div className="hidden md:flex items-center space-x-3 w-full mb-8 mt-4">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user.email)}`}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.full_name || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-row md:flex-col items-center md:items-stretch space-x-8 md:space-x-0 md:space-y-2 w-full">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === href
                  ? 'text-primary-600 dark:text-primary-500 bg-gray-100 dark:bg-gray-700'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  )
} 
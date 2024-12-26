'use client'

import Link from 'next/link'
import { FiMessageSquare, FiUsers, FiMail, FiSearch, FiUser } from 'react-icons/fi'

export default function LandingPage() {
  const features = [
    {
      icon: FiMessageSquare,
      title: 'Global Chat',
      description: 'Join our global chat room to connect with users from around the world in real-time.'
    },
    {
      icon: FiUsers,
      title: 'Group Chats',
      description: 'Create or join group chats for specific topics, interests, or communities.'
    },
    {
      icon: FiMail,
      title: 'Private Messages',
      description: 'Have private conversations with other users securely and confidentially.'
    },
    {
      icon: FiSearch,
      title: 'User Search',
      description: 'Find and connect with other users easily using our search feature.'
    },
    {
      icon: FiUser,
      title: 'Profile Customization',
      description: 'Personalize your profile with a custom avatar and display name.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome to ChatHub by -KNIGHT-
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          A modern real-time chat platform where conversations come alive. Connect,
          share, and collaborate with people around the world.
          NOTICE THAT THIS IS A BETA VERSION.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Everything you need to connect
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* How to Use Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm my-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          How to Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create an Account
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sign up with your email and create a personalized profile
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Join Conversations
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start chatting in the global chat or join specific group chats
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Connect with Others
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Search for users and start private conversations
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © 2025 knight-abdo. All rights reserved.
        </p>
      </footer>
    </div>
  )
} 
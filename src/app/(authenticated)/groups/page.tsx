'use client'

export default function GroupsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Group Chat</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Group chat functionality is coming soon! Create and manage group conversations with multiple participants.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Features to look forward to:
          <ul className="mt-2 space-y-1">
            <li>• Create custom groups</li>
            <li>• Add and remove members</li>
            <li>• Group media sharing</li>
            <li>• Group settings and roles</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
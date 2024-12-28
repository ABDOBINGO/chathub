'use client'

export default function NotificationsPage() {
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Stay tuned! Notifications feature is coming soon to keep you updated on all your conversations.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Upcoming notification types:
          <ul className="mt-2 space-y-1">
            <li>• New message alerts</li>
            <li>• Mention notifications</li>
            <li>• Group invites</li>
            <li>• Custom notification settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
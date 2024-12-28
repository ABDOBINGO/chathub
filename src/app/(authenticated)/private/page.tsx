'use client'

export default function PrivateMessagesPage() {
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
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Private Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Private messaging feature is coming soon! Have secure one-on-one conversations with other users.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Upcoming features:
          <ul className="mt-2 space-y-1">
            <li>• End-to-end encryption</li>
            <li>• Message reactions</li>
            <li>• File sharing</li>
            <li>• Read receipts</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
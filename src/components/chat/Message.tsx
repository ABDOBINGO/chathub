'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Message as MessageType } from '@/types/chat'
import { useAuth } from '@/lib/auth-context'

type MessageProps = {
  message: MessageType
  onEdit: (messageId: string, content: string) => void
  onDelete: (messageId: string) => void
  onReaction: (messageId: string, emoji: string) => void
  onPin: (messageId: string) => void
  onReport: (messageId: string, reason: string) => void
}

export default function Message({
  message,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onReport,
}: MessageProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)

  const isOwner = user?.id === message.user_id

  const handleEdit = () => {
    onEdit(message.id, editContent)
    setIsEditing(false)
  }

  const handleReport = () => {
    const reason = prompt('Please provide a reason for reporting this message:')
    if (reason) {
      onReport(message.id, reason)
    }
  }

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

  return (
    <div
      className={`group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
        message.is_pinned ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start">
        <div className="h-9 w-9 rounded-full bg-gray-400 flex items-center justify-center text-white">
          {message.user_email[0].toUpperCase()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{message.user_email}</p>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(message.created_at), 'MMM d, h:mm a')}
            </span>
            {message.is_edited && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(edited)</span>
            )}
            {message.is_pinned && (
              <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">📌 Pinned</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                rows={3}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Reactions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => onReaction(message.id, reaction.emoji)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {reaction.emoji} <span className="ml-1">{1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReaction(message.id, emoji)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>

          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                🗑️
              </button>
            </>
          )}

          <button
            onClick={() => onPin(message.id)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            📌
          </button>

          {!isOwner && (
            <button
              onClick={handleReport}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ⚠️
            </button>
          )}
        </div>
      )}
    </div>
  )
} 
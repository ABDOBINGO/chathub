'use client'

import { useEffect, useRef } from 'react'
import { Message as MessageType } from '@/types/chat'
import Message from './Message'

type MessageListProps = {
  messages: MessageType[]
  pinnedMessages: MessageType[]
  onLoadMore: () => void
  onEdit: (messageId: string, content: string) => void
  onDelete: (messageId: string) => void
  onReaction: (messageId: string, emoji: string) => void
  onPin: (messageId: string) => void
  onReport: (messageId: string, reason: string) => void
  hasMore: boolean
  loading: boolean
}

export default function MessageList({
  messages,
  pinnedMessages,
  onLoadMore,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onReport,
  hasMore,
  loading,
}: MessageListProps) {
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, onLoadMore])

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="sticky top-0 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/50">
          <div className="px-4 py-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            📌 Pinned Messages
          </div>
          {pinnedMessages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
              onPin={onPin}
              onReport={onReport}
            />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-col-reverse">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onEdit={onEdit}
            onDelete={onDelete}
            onReaction={onReaction}
            onPin={onPin}
            onReport={onReport}
          />
        ))}
      </div>

      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      )}
    </div>
  )
} 
export type Message = {
  id: string
  content: string
  user_id: string
  user_email: string
  created_at: string
  updated_at: string
  is_edited: boolean
  is_pinned: boolean
  reactions: MessageReaction[]
}

export type MessageReaction = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type ChatUser = {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  last_seen: string | null
  is_online: boolean
  is_typing: boolean
}

export type MessageReport = {
  id: string
  message_id: string
  reporter_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
  updated_at: string
} 
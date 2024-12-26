export interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  updated_at?: string
  voice_url?: string
  is_pinned?: boolean
  is_edited?: boolean
  reactions: {
    emoji: string
    count: number
    user_has_reacted: boolean
  }[]
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    email: string | null
  }
}

export interface ChatUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  last_seen?: string
  online?: boolean
}

export interface MessageStyle {
  className: string
  style: {
    backgroundColor: string
    color: string
  }
} 
export interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  voice_url?: string
  is_pinned?: boolean
  is_edited?: boolean
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    email: string | null
  }
}

export interface MessageStyle {
  className: string
  style: {
    backgroundColor: string
    color: string
  }
} 
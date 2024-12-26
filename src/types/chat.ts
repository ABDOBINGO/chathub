export interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  voice_url?: string
  profiles?: {
    full_name: string
    avatar_url: string
  }
}

export interface MessageStyle {
  className: string
  style: {
    backgroundColor: string
    color: string
  }
} 
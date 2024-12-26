import { create } from 'zustand'
import { Message, ChatUser } from '@/types/chat'
import { supabase } from './supabase'

interface ChatStore {
  messages: Message[]
  pinnedMessages: Message[]
  users: ChatUser[]
  loading: boolean
  hasMore: boolean
  lastMessageTimestamp: string | null
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  deleteMessage: (messageId: string) => void
  setPinnedMessages: (messages: Message[]) => void
  setUsers: (users: ChatUser[]) => void
  updateUserStatus: (userId: string, isOnline: boolean) => void
  updateUserTyping: (userId: string, isTyping: boolean) => void
  loadMoreMessages: () => Promise<void>
  sendMessage: (content: string, userId: string, userEmail: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  pinMessage: (messageId: string) => Promise<void>
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<void>
  reportMessage: (messageId: string, reporterId: string, reason: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  pinnedMessages: [],
  users: [],
  loading: false,
  hasMore: true,
  lastMessageTimestamp: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
      pinnedMessages: state.pinnedMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
      pinnedMessages: state.pinnedMessages.filter((msg) => msg.id !== messageId),
    })),

  setPinnedMessages: (messages) =>
    set(() => ({
      pinnedMessages: messages,
    })),

  setUsers: (users) =>
    set(() => ({
      users,
    })),

  updateUserStatus: (userId, isOnline) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, is_online: isOnline } : user
      ),
    })),

  updateUserTyping: (userId, isTyping) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, is_typing: isTyping } : user
      ),
    })),

  loadMoreMessages: async () => {
    const state = get()
    if (state.loading || !state.hasMore) return

    set({ loading: true })

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .lt('created_at', state.lastMessageTimestamp || new Date().toISOString())

    if (error) {
      console.error('Error loading messages:', error)
      set({ loading: false })
      return
    }

    set((state) => ({
      messages: [...state.messages, ...messages],
      loading: false,
      hasMore: messages.length === 20,
      lastMessageTimestamp: messages[messages.length - 1]?.created_at || null,
    }))
  },

  sendMessage: async (content, userId, userEmail) => {
    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          user_id: userId,
          user_email: userEmail,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    get().addMessage(message)
  },

  editMessage: async (messageId, content) => {
    const { error } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)

    if (error) {
      console.error('Error editing message:', error)
      return
    }

    get().updateMessage(messageId, {
      content,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
  },

  pinMessage: async (messageId) => {
    const message = get().messages.find((msg) => msg.id === messageId)
    if (!message) return

    const { error } = await supabase
      .from('messages')
      .update({
        is_pinned: !message.is_pinned,
      })
      .eq('id', messageId)

    if (error) {
      console.error('Error pinning message:', error)
      return
    }

    get().updateMessage(messageId, { is_pinned: !message.is_pinned })

    // Update pinned messages list
    const { data: pinnedMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })

    if (pinnedMessages) {
      get().setPinnedMessages(pinnedMessages)
    }
  },

  addReaction: async (messageId, userId, emoji) => {
    const { error } = await supabase.from('message_reactions').insert([
      {
        message_id: messageId,
        user_id: userId,
        emoji,
      },
    ])

    if (error) {
      console.error('Error adding reaction:', error)
      return
    }

    // Refresh message reactions
    const { data: reactions } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)

    if (reactions) {
      get().updateMessage(messageId, { reactions })
    }
  },

  reportMessage: async (messageId, reporterId, reason) => {
    const { error } = await supabase.from('message_reports').insert([
      {
        message_id: messageId,
        reporter_id: reporterId,
        reason,
        status: 'pending',
      },
    ])

    if (error) {
      console.error('Error reporting message:', error)
    }
  },
})) 
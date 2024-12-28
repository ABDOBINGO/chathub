'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { formatDistanceToNow } from 'date-fns'
import { FiSend, FiTrash2, FiMic, FiSquare, FiRefreshCw, FiPause, FiPlay } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { soundManager } from '@/lib/sounds'

type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

type Message = {
  id: string
  content: string
  voice_url?: string
  created_at: string
  user_id: string
  profiles?: Profile
}

export default function ChatPage() {
  const { user } = useAuth()
  const { settings } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles:user_id (*)')
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data as Message[] || [])
      scrollToBottom()
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    // Set up auto-refresh every 500ms for real-time updates
    const refreshInterval = setInterval(fetchMessages, 500)

    // Cleanup function
    return () => {
      channel.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, []) // Empty dependency array to run only once on mount

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: messageContent,
          user_id: user.id
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageContent)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      // Try different formats for maximum compatibility
      let mimeType = 'audio/mp4';
      let recorder;

      // Test different formats
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      }

      try {
        recorder = new MediaRecorder(stream, { mimeType })
      } catch (e) {
        // Fallback to default
        recorder = new MediaRecorder(stream)
      }

      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: mimeType })
        await handleVoiceUpload(audioBlob)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Please allow microphone access')
      } else {
        toast.error('Failed to start recording')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      toast.success('Recording stopped')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleVoiceUpload = async (audioBlob: Blob) => {
    if (!user) return

    setLoading(true)
    try {
      const timestamp = Date.now()
      // Use .m4a extension for iOS Safari compatibility
      const extension = audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
      const fileName = `voice-${timestamp}.${extension}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type
        })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(filePath)

      // Create message with voice URL
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          voice_url: publicUrl,
          user_id: user.id,
          content: ''
        }])

      if (messageError) throw messageError
      
      toast.success('Voice message sent')
    } catch (error) {
      console.error('Error uploading voice message:', error)
      toast.error('Failed to send voice message')
    } finally {
      setLoading(false)
    }
  }

  const getMessageStyle = (isOwnMessage: boolean) => {
    const style: React.CSSProperties = {
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
    }

    if (isOwnMessage) {
      style.backgroundColor = settings.primary_color
      style.color = '#FFFFFF'
    } else {
      style.backgroundColor = settings.theme === 'dark' ? '#374151' : '#F3F4F6'
      style.color = settings.theme === 'dark' ? '#FFFFFF' : '#111827'
    }

    switch (settings.bubble_style) {
      case 'modern':
        style.borderRadius = '1rem'
        break
      case 'rounded':
        style.borderRadius = '1.5rem'
        break
      case 'classic':
        style.borderRadius = '0.5rem'
        break
      case 'minimal':
        style.borderRadius = '0.25rem'
        break
    }

    return style
  }

  const handleAppearanceCode = (code: string) => {
    try {
      if (applyAppearance(code)) {
        toast.success('Appearance settings applied successfully!')
      } else {
        toast.error('Invalid appearance code')
      }
    } catch (error) {
      console.error('Error applying appearance:', error)
      toast.error('Failed to apply appearance settings')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Compact Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-2 text-sm">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1">
          <span className="font-semibold">Welcome to ChatHub</span>
          <span className="text-lg">👋</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Send messages, voice notes, and toggle auto-refresh in the top-right corner
        </p>
      </div>

      {/* Messages Section */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors`}
              style={{
                backgroundColor: autoRefresh ? `${settings.primary_color}20` : 'var(--bg-secondary)',
                color: autoRefresh ? settings.primary_color : 'var(--text-secondary)'
              }}
            >
              {autoRefresh ? (
                <>
                  <FiPause className="w-4 h-4" />
                  <span>Pause Updates</span>
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4" />
                  <span>Resume Updates</span>
                </>
              )}
            </button>
            <button
              onClick={fetchMessages}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Refresh messages"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div
                className={`flex items-start space-x-2 md:space-x-3 ${
                  message.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <img
                  src={message.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.profiles?.full_name || 'User')}`}
                  alt={message.profiles?.full_name || 'User'}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className={`flex flex-col max-w-[75%] ${message.user_id === user?.id ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div
                      style={getMessageStyle(message.user_id === user?.id)}
                      className="relative"
                    >
                      {message.voice_url ? (
                        <audio 
                          controls 
                          className="max-w-[240px]"
                          preload="none"
                        >
                          <source src={message.voice_url} type="audio/mp4" />
                          <source src={message.voice_url} type="audio/webm" />
                          <source src={message.voice_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <p className="break-words text-sm md:text-base">{message.content}</p>
                      )}
                      {settings.show_timestamps && (
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    {message.user_id === user?.id && (
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete message"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Fixed at bottom with padding for navigation */}
      <div className="sticky bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
            title={isRecording ? "Click to stop recording" : "Click to start recording"}
          >
            {isRecording ? (
              <FiSquare className="w-6 h-6 text-white" />
            ) : (
              <FiMic className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2"
            style={{ 
              '--tw-ring-color': settings.primary_color,
              '--tw-ring-opacity': '1'
            } as React.CSSProperties}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ 
              backgroundColor: settings.primary_color,
              '--tw-ring-color': settings.primary_color,
              '--tw-ring-opacity': '1'
            } as React.CSSProperties}
          >
            <FiSend className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  )
} 
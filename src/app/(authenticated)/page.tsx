'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiSend, FiTrash2, FiRefreshCw, FiPause, FiPlay, FiMic } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTheme } from '@/lib/theme-context'
import { soundManager } from '@/lib/sounds'

export default function HomePage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const messagesEndRef = useRef(null)
  const supabase = createClientComponentClient()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const { settings } = useTheme()

  const getMessageStyle = (isOwnMessage: boolean) => {
    const baseStyle = 'relative group p-3'
    const alignmentStyle = isOwnMessage ? 'ml-auto' : ''
    
    let bubbleStyle = ''
    switch (settings.bubble_style) {
      case 'modern':
        bubbleStyle = isOwnMessage ? 'rounded-lg rounded-br-none' : 'rounded-lg rounded-bl-none'
        break
      case 'rounded':
        bubbleStyle = 'rounded-[24px]'
        break
      case 'minimal':
        bubbleStyle = 'rounded-sm'
        break
      default:
        bubbleStyle = 'rounded-lg'
    }

    return {
      className: `${baseStyle} ${alignmentStyle} ${bubbleStyle}`,
      style: { 
        backgroundColor: isOwnMessage ? settings.primary_color : 'var(--bg-secondary)',
        color: isOwnMessage ? 'white' : 'var(--text-primary)'
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchMessages()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            user_id: user.id,
          },
        ])

      if (error) throw error

      setNewMessage('')
      await fetchMessages()
      if (settings.enable_sounds) {
        soundManager.play('messageSent')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .match({ id: messageId })

      if (error) throw error

      await fetchMessages()
      toast.success('Message deleted')
      if (settings.enable_sounds) {
        soundManager.play('error')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        if (settings.enable_sounds) {
          soundManager.play('recordingStop')
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      if (settings.enable_sounds) {
        soundManager.play('recordingStart')
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  const sendVoiceMessage = async () => {
    if (!audioBlob || !user) return

    setLoading(true)
    try {
      // Upload audio file
      const fileName = `${user.id}/${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName)

      // Save message with audio URL
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            content: '🎤 Voice Message',
            user_id: user.id,
            voice_url: publicUrl
          }
        ])

      if (messageError) throw messageError

      setAudioBlob(null)
      if (settings.enable_sounds) {
        soundManager.play('messageSent')
      }
      await fetchMessages()
    } catch (error) {
      console.error('Error sending voice message:', error)
      toast.error('Failed to send voice message')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (settings.enable_sounds && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.user_id !== user?.id) {
        soundManager.play('messageReceived')
      }
    }
  }, [messages, settings.enable_sounds])

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to ChatHub! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This is a global chat room where you can communicate with other users. Here's how to use it:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400 space-y-1">
          <li>Type your message in the input box below and press Enter or click Send</li>
          <li>Messages will automatically refresh every 0.5 seconds</li>
          <li>You can toggle auto-refresh using the button in the top-right corner</li>
          <li>Click the trash icon on your own messages to delete them</li>
        </ul>
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
            <div
              key={message.id}
              className={`flex ${settings.message_alignment === 'right' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                <div {...getMessageStyle(message.user_id === user.id)}>
                  {message.voice_url ? (
                    <audio controls className="w-full max-w-[200px]">
                      <source src={message.voice_url} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                  {settings.show_timestamps && (
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  )}
                  {message.user_id === user.id && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="absolute -right-2 -top-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
            style={{ 
              '--tw-ring-color': settings.primary_color,
              '--tw-ring-opacity': '1'
            } as React.CSSProperties}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ 
              backgroundColor: settings.primary_color,
              '--tw-ring-color': settings.primary_color,
              '--tw-ring-opacity': '1'
            } as React.CSSProperties}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center space-x-2 mt-2">
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`p-2 rounded-full transition-colors ${
              isRecording ? 'bg-red-500 recording-pulse' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
            title="Hold to record voice message"
          >
            <FiMic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
          {audioBlob && (
            <button
              type="button"
              onClick={sendVoiceMessage}
              className="p-2 text-white rounded-full transition-colors"
              style={{ backgroundColor: settings.primary_color }}
              title="Send voice message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 
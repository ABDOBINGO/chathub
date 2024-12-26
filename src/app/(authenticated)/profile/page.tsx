'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from '@/lib/theme-context'
import { useRouter } from 'next/navigation'
import { FiUser, FiSettings, FiLayout, FiMessageCircle, FiSun, FiMoon, FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    theme: 'light',
    bubble_style: 'modern',
    primary_color: '#0066FF',
    message_alignment: 'right',
    enable_sounds: true,
    show_timestamps: true,
    show_read_receipts: true,
    enable_notifications: true
  })
  const supabase = createClientComponentClient()
  const { settings, updateSettings } = useTheme()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        ...profile,
        ...data,
        theme: data.theme || 'light',
        bubble_style: data.bubble_style || 'modern',
        primary_color: data.primary_color || '#0066FF',
        message_alignment: data.message_alignment || 'right',
        enable_sounds: data.enable_sounds !== false,
        show_timestamps: data.show_timestamps !== false,
        show_read_receipts: data.show_read_receipts !== false,
        enable_notifications: data.enable_notifications !== false
      })

      // Also update theme context
      updateSettings({
        theme: data.theme || 'light',
        bubble_style: data.bubble_style || 'modern',
        primary_color: data.primary_color || '#0066FF',
        message_alignment: data.message_alignment || 'right',
        enable_sounds: data.enable_sounds !== false,
        show_timestamps: data.show_timestamps !== false,
        show_read_receipts: data.show_read_receipts !== false,
        enable_notifications: data.enable_notifications !== false
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Update auth metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      })

      if (updateAuthError) throw updateAuthError

      // Update profile with all customization options
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          theme: profile.theme,
          bubble_style: profile.bubble_style,
          primary_color: profile.primary_color,
          message_alignment: profile.message_alignment,
          enable_sounds: profile.enable_sounds,
          show_timestamps: profile.show_timestamps,
          show_read_receipts: profile.show_read_receipts,
          enable_notifications: profile.enable_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateProfileError) throw updateProfileError

      // Update theme context
      await updateSettings({
        theme: profile.theme,
        bubble_style: profile.bubble_style,
        primary_color: profile.primary_color,
        message_alignment: profile.message_alignment,
        enable_sounds: profile.enable_sounds,
        show_timestamps: profile.show_timestamps,
        show_read_receipts: profile.show_read_receipts,
        enable_notifications: profile.enable_notifications
      })

      toast.success('Profile updated successfully')
      await fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success('Avatar updated successfully')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const bubbleStyles = [
    { id: 'modern', name: 'Modern', preview: '◢' },
    { id: 'rounded', name: 'Rounded', preview: '◠' },
    { id: 'minimal', name: 'Minimal', preview: '─' }
  ]

  const previewMessage = {
    content: "Hello! This is how your messages will look.",
    timestamp: new Date().toLocaleTimeString()
  }

  const getPreviewStyle = () => {
    let bubbleStyle = ''
    switch (profile.bubble_style) {
      case 'modern':
        bubbleStyle = 'rounded-lg rounded-br-none'
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

    return `max-w-[80%] p-3 ${bubbleStyle}`
  }

  const generateAppearanceCode = () => {
    const codeData = {
      theme: settings.theme,
      bubble_style: settings.bubble_style,
      primary_color: settings.primary_color,
      message_alignment: settings.message_alignment
    }
    return btoa(JSON.stringify(codeData))
  }

  const applyAppearanceCode = (code: string) => {
    try {
      const decodedData = JSON.parse(atob(code))
      updateSettings(decodedData)
      toast.success('Appearance settings applied successfully!')
    } catch (error) {
      toast.error('Invalid appearance code')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Tabs - Scrollable on mobile */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex whitespace-nowrap px-4 md:px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 md:py-4 px-3 md:px-4 inline-flex items-center gap-2 border-b-2 ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUser className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-3 md:py-4 px-3 md:px-4 inline-flex items-center gap-2 border-b-2 ${
                activeTab === 'appearance'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiLayout className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Appearance</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 md:py-4 px-3 md:px-4 inline-flex items-center gap-2 border-b-2 ${
                activeTab === 'preferences'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiSettings className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Preferences</span>
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || user?.email || '')}`}
                  alt={profile.full_name || 'Avatar'}
                  className="w-24 h-24 md:w-20 md:h-20 rounded-full object-cover mx-auto md:mx-0 mb-4 md:mb-0"
                />
                <label className="flex justify-center md:justify-start">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Change Avatar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, theme: 'light' })}
                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
                      profile.theme === 'light'
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiSun className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, theme: 'dark' })}
                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
                      profile.theme === 'dark'
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiMoon className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={profile.primary_color}
                    onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <span className="text-sm text-gray-500">{profile.primary_color}</span>
                </div>
              </div>

              {/* Bubble Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Bubble Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {bubbleStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, bubble_style: style.id })}
                      className={`p-3 md:p-4 text-center border rounded-lg ${
                        profile.bubble_style === style.id
                          ? 'border-primary-500 text-primary-600 bg-primary-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-xl md:text-2xl mb-1 md:mb-2">{style.preview}</div>
                      <div className="text-xs md:text-sm">{style.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Alignment
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, message_alignment: 'left' })}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg border ${
                      profile.message_alignment === 'left'
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, message_alignment: 'right' })}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg border ${
                      profile.message_alignment === 'right'
                        ? 'border-primary-500 text-primary-600 bg-primary-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Right
                  </button>
                </div>
              </div>

              {/* Share Appearance Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Share Appearance
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Your Appearance Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={generateAppearanceCode()}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generateAppearanceCode())
                          toast.success('Code copied to clipboard!')
                        }}
                        className="px-3 py-2 text-white rounded-lg"
                        style={{ backgroundColor: profile.primary_color }}
                      >
                        <FiCopy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Apply Appearance Code
                    </label>
                    <input
                      type="text"
                      placeholder="Paste appearance code here"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          applyAppearanceCode(e.target.value.trim())
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <div
                    className={`flex ${
                      profile.message_alignment === 'right' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={getPreviewStyle()}
                      style={{ backgroundColor: profile.primary_color, color: 'white' }}
                    >
                      <p>{previewMessage.content}</p>
                      {profile.show_timestamps && (
                        <p className="text-xs opacity-75 mt-1">{previewMessage.timestamp}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message Sounds
                  </h3>
                  <p className="text-sm text-gray-500">Play sounds for new messages</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, enable_sounds: !profile.enable_sounds })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    profile.enable_sounds ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      profile.enable_sounds ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Timestamps
                  </h3>
                  <p className="text-sm text-gray-500">Display time for each message</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, show_timestamps: !profile.show_timestamps })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    profile.show_timestamps ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      profile.show_timestamps ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Read Receipts
                  </h3>
                  <p className="text-sm text-gray-500">Show when messages are read</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, show_read_receipts: !profile.show_read_receipts })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    profile.show_read_receipts ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      profile.show_read_receipts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Desktop Notifications
                  </h3>
                  <p className="text-sm text-gray-500">Get notified about new messages</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, enable_notifications: !profile.enable_notifications })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    profile.enable_notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      profile.enable_notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
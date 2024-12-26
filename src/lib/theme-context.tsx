'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from './auth-context'

type ThemeSettings = {
  theme: string
  bubble_style: string
  primary_color: string
  message_alignment: string
  enable_sounds: boolean
  show_timestamps: boolean
  show_read_receipts: boolean
  enable_notifications: boolean
}

type ThemeContextType = {
  settings: ThemeSettings
  updateSettings: (newSettings: Partial<ThemeSettings>) => Promise<void>
}

const defaultSettings: ThemeSettings = {
  theme: 'light',
  bubble_style: 'modern',
  primary_color: '#0066FF',
  message_alignment: 'right',
  enable_sounds: true,
  show_timestamps: true,
  show_read_receipts: true,
  enable_notifications: true
}

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  updateSettings: async () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user?.id) {
      loadSettings()
    }
  }, [user?.id])

  useEffect(() => {
    applyThemeSettings(settings)
  }, [settings])

  const applyThemeSettings = (settings: ThemeSettings) => {
    const root = document.documentElement
    
    // Apply theme
    root.classList.toggle('dark', settings.theme === 'dark')
    root.style.colorScheme = settings.theme
    
    // Apply CSS variables
    root.style.setProperty('--primary-color', settings.primary_color)
    root.style.setProperty('--message-alignment', settings.message_alignment)
    root.style.setProperty('--bubble-style', settings.bubble_style)
    
    // Apply background colors based on theme
    if (settings.theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1F2937')
      root.style.setProperty('--bg-secondary', '#374151')
      root.style.setProperty('--text-primary', '#F9FAFB')
      root.style.setProperty('--text-secondary', '#D1D5DB')
    } else {
      root.style.setProperty('--bg-primary', '#FFFFFF')
      root.style.setProperty('--bg-secondary', '#F3F4F6')
      root.style.setProperty('--text-primary', '#111827')
      root.style.setProperty('--text-secondary', '#4B5563')
    }
  }

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme, bubble_style, primary_color, message_alignment, enable_sounds, show_timestamps, show_read_receipts, enable_notifications')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        const newSettings = {
          ...defaultSettings,
          ...data,
          theme: data.theme || defaultSettings.theme,
          bubble_style: data.bubble_style || defaultSettings.bubble_style,
          primary_color: data.primary_color || defaultSettings.primary_color,
          message_alignment: data.message_alignment || defaultSettings.message_alignment,
          enable_sounds: data.enable_sounds !== false,
          show_timestamps: data.show_timestamps !== false,
          show_read_receipts: data.show_read_receipts !== false,
          enable_notifications: data.enable_notifications !== false
        }
        setSettings(newSettings)
        applyThemeSettings(newSettings)
      }
    } catch (error) {
      console.error('Error loading theme settings:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<ThemeSettings>) => {
    if (!user?.id) return

    const updatedSettings = { ...settings, ...newSettings }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(newSettings)
        .eq('id', user.id)

      if (error) throw error
      
      setSettings(updatedSettings)
      applyThemeSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating theme settings:', error)
    }
  }

  useEffect(() => {
    if (!user) return
    
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme, bubble_style, primary_color, message_alignment, enable_sounds, show_timestamps, show_read_receipts, enable_notifications')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data) {
          setSettings({
            ...defaultSettings,
            ...data
          })
        }
      } catch (error) {
        console.error('Error fetching theme settings:', error)
      }
    }

    fetchSettings()
  }, [user])

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 
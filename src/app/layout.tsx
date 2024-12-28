'use client'

import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useEffect } from 'react'
import { initAppearance, loadAppearance } from '@/utils/appearance'
import './globals.css'

const defaultSettings = {
  theme: 'light',
  bubble_style: 'modern',
  primary_color: '#6366F1',
  message_alignment: 'right',
  show_timestamps: true
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Initialize with default settings if none exist
    const savedSettings = loadAppearance()
    if (!savedSettings) {
      initAppearance()
    }
    
    // Apply theme from saved settings
    const settings = savedSettings || defaultSettings
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 
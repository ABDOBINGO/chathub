'use client'

import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { Toaster } from 'react-hot-toast'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
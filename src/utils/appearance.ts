interface AppearanceSettings {
  theme: 'light' | 'dark';
  bubbleStyle: 'rounded' | 'square';
  primaryColor: string;
  messageAlignment: 'left' | 'right';
}

const APPEARANCE_KEY = 'chathub_appearance'

export function saveAppearance(settings: AppearanceSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings))
  }
}

export function loadAppearance(): AppearanceSettings | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(APPEARANCE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing appearance settings:', e)
      }
    }
  }
  return null
}

export function applyAppearance(code: string): boolean {
  try {
    const settings = JSON.parse(atob(code)) as AppearanceSettings
    saveAppearance(settings)
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor)

    // Apply bubble style
    document.documentElement.setAttribute('data-bubble-style', settings.bubbleStyle)

    // Apply message alignment
    document.documentElement.setAttribute('data-message-align', settings.messageAlignment)

    return true
  } catch (e) {
    console.error('Error applying appearance code:', e)
    return false
  }
}

export function initAppearance() {
  const settings = loadAppearance()
  if (settings) {
    applyAppearance(btoa(JSON.stringify(settings)))
  }
} 
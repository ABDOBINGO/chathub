interface AppearanceSettings {
  theme: 'light' | 'dark';
  bubble_style: 'modern' | 'rounded' | 'classic' | 'minimal';
  primary_color: string;
  message_alignment: 'left' | 'right';
  show_timestamps: boolean;
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
    document.documentElement.style.setProperty('--primary-color', settings.primary_color)

    // Apply bubble style
    document.documentElement.setAttribute('data-bubble-style', settings.bubble_style)

    // Apply message alignment
    document.documentElement.setAttribute('data-message-align', settings.message_alignment)

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
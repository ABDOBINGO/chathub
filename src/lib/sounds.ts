const sounds = {
  messageSent: '/sounds/message-sent.mp3',
  messageReceived: '/sounds/message-received.mp3',
  recordingStart: '/sounds/recording-start.mp3',
  recordingStop: '/sounds/recording-stop.mp3',
  notification: '/sounds/notification.mp3',
  error: '/sounds/error.mp3'
}

class SoundManager {
  private audioCache: { [key: string]: HTMLAudioElement } = {}
  private enabled: boolean = true

  constructor() {
    // Preload sounds
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.load() // Preload the audio
      this.audioCache[key] = audio
    })
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  play(soundName: keyof typeof sounds) {
    if (!this.enabled) return

    const audio = this.audioCache[soundName]
    if (audio) {
      audio.currentTime = 0 // Reset to start
      audio.play().catch(err => console.error('Error playing sound:', err))
    }
  }

  // Play with volume control (0.0 to 1.0)
  playWithVolume(soundName: keyof typeof sounds, volume: number) {
    if (!this.enabled) return

    const audio = this.audioCache[soundName]
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
      audio.currentTime = 0
      audio.play().catch(err => console.error('Error playing sound:', err))
    }
  }
}

export const soundManager = new SoundManager() 
import popSound from './../assets/sounds/bubble-pop.mp3'
import clickSound from './../assets/sounds/button-click.mp3'
import saveSound from './../assets/sounds/button-save.mp3'
import cancelSound from './../assets/sounds/button-cancel.mp3'
import shotSound from './../assets/sounds/shot.mp3'
import bombSound from './../assets/sounds/bomb-sound.mp3'
import laserSound from './../assets/sounds/laser-sound.mp3'

class SoundManager {
  constructor() {
    this.soundPaths = {
      pop: popSound,
      click: clickSound,
      save: saveSound,
      cancel: cancelSound,
      shot: shotSound,
      bomb: bombSound,
      laser: laserSound
    }

    this.volumes = {
      pop: 0.2,
      click: 0.1,
      save: 0.1,
      cancel: 0.05,
      shot: 0.1,
      bomb: 0.5,
      laser: 0.1
    }

    this.activeSounds = []
    this.preloadedSounds = {}
  }
  
  preloadAll() {
    Object.keys(this.soundPaths).forEach(soundName => {
      this.preload(soundName)
    })
  }

  preload(soundName) {
    if (this.preloadedSounds[soundName]) return
    
    const soundPath = this.soundPaths[soundName]
    if (!soundPath) return
    
    const audio = new Audio(soundPath)
    audio.volume = this.volumes[soundName] || 0.5
    audio.preload = 'auto'
    audio.load()
    this.preloadedSounds[soundName] = audio
  }
  
  play(soundName) {
    const soundPath = this.soundPaths[soundName]
    if (!soundPath) {
      console.log(`Звук ${soundName} не найден`)
      return
    }
    
    let audio
    if (this.preloadedSounds[soundName]) {
      audio = this.preloadedSounds[soundName].cloneNode()
      audio.volume = this.volumes[soundName] || 0.5
    } else {
      audio = new Audio(soundPath)
      audio.volume = this.volumes[soundName] || 0.5
    }

    this.activeSounds.push({ audio, soundName })

    audio.addEventListener('ended', () => {
      const index = this.activeSounds.findIndex(item => item.audio === audio)
      if (index > -1) {
        this.activeSounds.splice(index, 1)
      }
    })

    audio.play().catch(e => console.log('Ошибка воспроизведения:', e))
  }

  stopAll() {
    this.activeSounds.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
    })
    this.activeSounds = []
  }

  stop(soundName) {
    const soundsToRemove = this.activeSounds.filter(item => item.soundName === soundName)
    
    soundsToRemove.forEach(item => {
      item.audio.pause()
      item.audio.currentTime = 0
    })
    
    this.activeSounds = this.activeSounds.filter(item => item.soundName !== soundName)
  }

  setVolume(soundName, volume) {
    if (this.volumes[soundName] !== undefined) {
      this.volumes[soundName] = Math.max(0, Math.min(1, volume))
    }
  }
  
  destroy() {
    this.stopAll()
  }
}

export default new SoundManager()
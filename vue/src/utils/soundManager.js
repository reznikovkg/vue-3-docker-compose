import popSound from './../assets/sounds/bubble-pop.mp3'
import clickSound from './../assets/sounds/button-click.mp3'
import saveSound from './../assets/sounds/button-save.mp3'
import cancelSound from './../assets/sounds/button-cancel.mp3'
import shotSound from './../assets/sounds/shot.mp3'
import bombSound from './../assets/sounds/bomb-sound.mp3'

class SoundManager {
  constructor() {
    this.soundPaths = {
      pop: popSound,
      click: clickSound,
      save: saveSound,
      cancel: cancelSound,
      shot: shotSound,
      bomb: bombSound,
    }

    this.volumes = {
      pop: 0.5,
      click: 0.7,
      save: 0.6,
      cancel: 0.3,
      shot: 0.4,
      bomb: 0.6,
    }

    this.activeSounds = []
  }
  
  play(soundName) {
    const soundPath = this.soundPaths[soundName]
    if (!soundPath) {
      console.log(`Звук ${soundName} не найден`)
      return
    }
    
    const audio = new Audio(soundPath)
    audio.volume = this.volumes[soundName] || 0.5

    this.activeSounds.push(audio)

    audio.addEventListener('ended', () => {
      const index = this.activeSounds.indexOf(audio)
      if (index > -1) {
        this.activeSounds.splice(index, 1)
      }
    })

    audio.play().catch(e => console.log('Ошибка воспроизведения:', e))
  }

  stopAll() {
    this.activeSounds.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    this.activeSounds = []
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
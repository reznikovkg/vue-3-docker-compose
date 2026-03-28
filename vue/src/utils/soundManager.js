import popSound from './../assets/sounds/bubble-pop.mp3'
import clickSound from './../assets/sounds/button-click.mp3'
import saveSound from './../assets/sounds/button-save.mp3'
import cancelSound from './../assets/sounds/button-cancel.mp3'
import shotSound from './../assets/sounds/shot.mp3'
import bombSound from './../assets/sounds/bomb-sound.mp3'

class SoundManager {
  constructor() {
    this.sounds = {
      pop: new Audio(popSound),
      click: new Audio(clickSound),
      save: new Audio(saveSound),
      cancel: new Audio(cancelSound),
      shot: new Audio(shotSound),
      bomb: new Audio(bombSound),
    }

    this.sounds.pop.volume = 0.5
    this.sounds.click.volume = 0.7
    this.sounds.save.volume = 0.6
    this.sounds.cancel.volume = 0.3
    this.sounds.shot.volume = 0.4
    this.sounds.bomb.volume = 0.6
  }
  
  play(soundName) {
    const sound = this.sounds[soundName]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(e => console.log('Ошибка воспроизведения:', e))
    }
  }
  
  destroy() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause()
      sound.src = ''
    })
  }
}

export default new SoundManager()
import soundManager from './../../soundManager'

class LaserPulseAnimation {
  constructor(cursorUI) {
    this.cursorUI = cursorUI
    this.animationFrame = null
    this.currentMode = null
    this.scale = 1
    this.direction = 1
    this.lastTimestamp = 0
    this.pulseDuration = 250
    this.soundTimeout = null
  }

  start(mode) {
    this.stop()
    this.currentMode = mode
    this.scale = 0.8
    this.direction = 1
    this.lastTimestamp = performance.now()
    
    const animate = (currentTime) => {
      if (this.currentMode !== mode) return

      const delta = Math.min(100, currentTime - this.lastTimestamp)
      this.lastTimestamp = currentTime
      
      const step = (delta / this.pulseDuration) * 0.4
      
      if (this.direction === 1) {
        this.scale += step
        if (this.scale >= 1.2) {
          this.scale = 1.2
          this.direction = -1
        }
      } else {
        this.scale -= step
        if (this.scale <= 0.8) {
          this.scale = 0.8
          this.direction = 1
        }
      }

      this.cursorUI.setTransform(`scale(${this.scale})`)
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    this.animationFrame = requestAnimationFrame(animate)

    const playLaserSound = () => {
      if (this.currentMode === mode) {
        soundManager.play('laser')
        this.soundTimeout = setTimeout(playLaserSound, 2500)
      }
    }
    playLaserSound()
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    soundManager.stop('laser')

    if (this.soundTimeout) {
      clearTimeout(this.soundTimeout)
      this.soundTimeout = null
    }

    this.cursorUI.setTransform('')
  }
}

export default LaserPulseAnimation
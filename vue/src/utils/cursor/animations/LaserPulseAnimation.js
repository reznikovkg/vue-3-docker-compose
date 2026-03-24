class LaserPulseAnimation {
  constructor(cursorUI) {
    this.cursorUI = cursorUI
    this.animationFrame = null
    this.currentMode = null
    this.scale = 1
    this.direction = 1
  }

  start(mode) {
    this.stop()
    this.currentMode = mode
    this.scale = 1
    this.direction = 1
    
    const animate = () => {
      if (this.currentMode !== mode) return
      
      this.scale += this.direction * 0.02
      if (this.scale >= 1.2) {
        this.scale = 1.2
        this.direction = -1
      } else if (this.scale <= 0.8) {
        this.scale = 0.8
        this.direction = 1
      }

      this.cursorUI.setTransform(`scale(${this.scale})`)
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    this.animationFrame = requestAnimationFrame(animate)
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.cursorUI.setTransform('')
  }
}

export default LaserPulseAnimation
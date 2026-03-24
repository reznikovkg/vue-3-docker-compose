class AutoShootAnimation {
  constructor(cursorUI, shotMarkerManager) {
    this.cursorUI = cursorUI
    this.shotMarkerManager = shotMarkerManager
    this.animationFrame = null
    this.lastTime = 0
    this.currentMode = null
  }

  start(mode, getCursorPosition) {
    this.stop()
    this.currentMode = mode
    this.lastTime = performance.now()
    
    const animate = (currentTime) => {
      if (this.currentMode !== mode) return
      
      if (currentTime - this.lastTime >= 500) {
        this.lastTime = currentTime
        
        this.cursorUI.setTransform('scale(1.3)')
        setTimeout(() => {
          if (this.currentMode === mode) {
            this.cursorUI.setTransform('')
          }
        }, 100)

        const pos = getCursorPosition()
        if (pos) {
          this.shotMarkerManager.create(pos.x, pos.y)
        }
      }
      
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

export default AutoShootAnimation
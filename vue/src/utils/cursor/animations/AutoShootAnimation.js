import soundManager from "./../../soundManager"

class AutoShootAnimation {
  constructor(cursorUI, shotMarkerManager) {
    this.cursorUI = cursorUI
    this.shotMarkerManager = shotMarkerManager
    this.animationFrame = null
    this.lastTime = 0
    this.currentMode = null
    this.shootTimeout = null
  }

  start(mode, getCursorPosition, onShoot = null) {
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
            const pos = getCursorPosition()
            if (pos) {
              if (onShoot) {
                onShoot(pos.x, pos.y)
              }
              this.shotMarkerManager.create(pos.x, pos.y)
              soundManager.play('shot')
            }
          }
        }, 50)
        
        setTimeout(() => {
          if (this.currentMode === mode) {
            this.cursorUI.setTransform('')
          }
        }, 50)
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
    if (this.shootTimeout) {
      clearTimeout(this.shootTimeout)
      this.shootTimeout = null
    }
    this.cursorUI.setTransform('')
  }
}

export default AutoShootAnimation
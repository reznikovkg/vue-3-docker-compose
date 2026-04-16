import CursorUI from './CursorUI'
import ShotMarkerManager from './ShotMarkerManager.js'
import ClickEffectAnimation from './animations/ClickEffectAnimation.js'
import AutoShootAnimation from './animations/AutoShootAnimation.js'
import LaserPulseAnimation from './animations/LaserPulseAnimation.js'

import defaultCursor from './../../assets/cursors/default.png'
import autoCursor from './../../assets/cursors/auto.png'
import laserCursor from './../../assets/cursors/laser.png'
import bombCursor from './../../assets/cursors/bomb.png'

class CursorManager {
  static preloadImages() {
    const cursorPaths = [defaultCursor, autoCursor, laserCursor, bombCursor]
    
    cursorPaths.forEach(path => {
      const img = new Image()
      img.src = path
    })
  }

  constructor(canvas) {
    this.canvas = canvas
    this.currentMode = 'click'
    this.cursorUI = new CursorUI()
    this.shotMarkerManager = new ShotMarkerManager()
    this.animations = {
      click: new ClickEffectAnimation(this.cursorUI),
      auto: new AutoShootAnimation(this.cursorUI, this.shotMarkerManager),
      laser: new LaserPulseAnimation(this.cursorUI)
    }
    
    this.cursorImages = {
      click: { path: defaultCursor, width: 64, height: 64 },
      auto: { path: autoCursor, width: 64, height: 64 },
      laser: { path: laserCursor, width: 32, height: 32 },
      bomb: { path: bombCursor, width: 64, height: 64}
    }
    
    if (this.canvas) {
      this.canvas.style.cursor = 'none'
    }
    
    this.initMouseTracking()
    this.setMode('click')
    this.onShootCallback = null
    this.onBombPlacedCallback = null
    this.isBombMode = false
    this.savedMode = 'click'
  }

  setOnShootCallback(callback) {
    this.onShootCallback = callback
  }

  setOnBombPlaced(callback) {
    this.onBombPlacedCallback = callback
  }

  activateBombMode() {
    if (this.isBombMode) return
    
    this.isBombMode = true
    this.savedMode = this.currentMode
    
    const currentAnim = this.animations[this.currentMode]
    if (currentAnim) {
      currentAnim.stop()
    }

    const bombImage = this.cursorImages.bomb
    this.cursorUI.setImage(bombImage.path, bombImage.width, bombImage.height)
    this.cursorUI.setTransform('')
  }

  deactivateBombMode() {
    if (!this.isBombMode) return
    
    this.isBombMode = false
    this.setMode(this.savedMode)
  }

  isBombActive() {
    return this.isBombMode
  }

  handleBombClick(x, y) {
    if (this.isBombMode && this.onBombPlacedCallback) {
      this.onBombPlacedCallback(x, y)
      return true
    }
    return false
  }

  startModeAnimation() {
    Object.values(this.animations).forEach(anim => anim.stop())
    
    switch (this.currentMode) {
      case 'click':
        this.animations.click.start(this.canvas)
        break
      case 'auto':
        this.animations.auto.start(
          this.currentMode,
          () => this.getCursorPosition(),
          (x, y) => {
            if (this.onShootCallback) {
              this.onShootCallback(x, y)
            }
          }
        )
        break
      case 'laser':
        this.animations.laser.start(this.currentMode)
        break
    }
  }

  initMouseTracking() {
    const updatePosition = (e) => {
      this.cursorUI.setPosition(e.clientX, e.clientY)
      this.lastMousePos = { x: e.clientX, y: e.clientY }
    }
    
    window.addEventListener('mousemove', updatePosition)
    this.mouseMoveCleanup = () => window.removeEventListener('mousemove', updatePosition)
  }

  getCursorPosition() {
    return this.lastMousePos || { x: 0, y: 0 }
  }

  setMode(mode) {
    if (this.isBombMode) {
      this.savedMode = mode
      return
    }

    this.currentMode = mode
    const image = this.cursorImages[mode]
    this.cursorUI.setImage(image.path, image.width, image.height)
    this.startModeAnimation()
  }

  resetToDefault() {
    this.cursorUI.hide()
    this.shotMarkerManager.clearAll()
    Object.values(this.animations).forEach(anim => anim.stop())
    if (this.canvas) {
      this.canvas.style.cursor = 'default'
    }
    this.isBombMode = false
  }

  show() {
    this.cursorUI.show()
    if (this.canvas) {
      this.canvas.style.cursor = 'none'
    }
    if (!this.isBombMode) {
      this.startModeAnimation()
    }
  }

  destroy() {
    this.resetToDefault()
    if (this.mouseMoveCleanup) {
      this.mouseMoveCleanup()
    }
    this.cursorUI.destroy()
  }
}

export default CursorManager
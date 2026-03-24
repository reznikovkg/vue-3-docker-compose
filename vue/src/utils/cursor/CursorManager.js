import CursorUI from './CursorUI'
import ShotMarkerManager from './ShotMarkerManager.js'
import ClickEffectAnimation from './animations/ClickEffectAnimation.js'
import AutoShootAnimation from './animations/AutoShootAnimation.js'
import LaserPulseAnimation from './animations/LaserPulseAnimation.js'

import defaultCursor from './../../assets/cursors/default.png'
import autoCursor from './../../assets/cursors/auto.png'
import laserCursor from './../../assets/cursors/laser.png'

class CursorManager {
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
      laser: { path: laserCursor, width: 32, height: 32 }
    }
    
    if (this.canvas) {
      this.canvas.style.cursor = 'none'
    }
    
    this.initMouseTracking()
    this.setMode('click')
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
    this.currentMode = mode
    const image = this.cursorImages[mode]
    this.cursorUI.setImage(image.path, image.width, image.height)
    this.startModeAnimation()
  }

  startModeAnimation() {
    Object.values(this.animations).forEach(anim => anim.stop())
    
    switch (this.currentMode) {
      case 'click':
        this.animations.click.start(this.canvas)
        break
      case 'auto':
        this.animations.auto.start(this.currentMode, () => this.getCursorPosition())
        break
      case 'laser':
        this.animations.laser.start(this.currentMode)
        break
    }
  }

  resetToDefault() {
    this.cursorUI.hide()
    this.shotMarkerManager.clearAll()
    Object.values(this.animations).forEach(anim => anim.stop())
    if (this.canvas) {
      this.canvas.style.cursor = 'default'
    }
  }

  show() {
    this.cursorUI.show()
    if (this.canvas) {
      this.canvas.style.cursor = 'none'
    }
    this.startModeAnimation()
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
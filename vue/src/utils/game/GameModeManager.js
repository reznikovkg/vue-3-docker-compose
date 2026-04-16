class GameModeManager {
  constructor(gameInstance) {
    this.game = gameInstance
    this.currentMode = 'click'
    this.autoInterval = null
    this.lastMousePos = { x: 0, y: 0 }
  }

  setMode(mode) {
    this.stopCurrentMode()
    this.currentMode = mode
    this.startCurrentMode()
  }

  startCurrentMode() {
    switch (this.currentMode) {
      case 'click':
        this.startClickMode()
        break
      case 'auto':
        this.startAutoMode()
        break
      case 'laser':
        this.startLaserMode()
        break
    }
  }

  stopCurrentMode() {
    switch (this.currentMode) {
      case 'auto':
        this.stopAutoMode()
        break
    }
  }

  startClickMode() {
    this.game.enableClickHandler(true)
  }

  startAutoMode() {
    this.game.enableClickHandler(false)
  }

  stopAutoMode() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval)
      this.autoInterval = null
    }
  }

  startLaserMode() {
    this.game.enableClickHandler(false)
  }

  updateMousePosition(x, y) {
    this.lastMousePos = { x, y }
    if (this.currentMode === 'laser') {
      this.game.popBubbleAtPosition(x, y)
    }
  }

  destroy() {
    this.stopAutoMode()
  }
}

export default GameModeManager
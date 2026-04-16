class ClickEffectAnimation {
  constructor(cursorUI) {
    this.cursorUI = cursorUI
    this.isPressed = false
    this.cleanup = null
  }

  start(canvas) {
    const onMouseDown = () => {
      if (this.isPressed) return
      this.isPressed = true
      this.cursorUI.setTransform('scale(0.8)')
      setTimeout(() => {
        this.cursorUI.setTransform('')
        this.isPressed = false
      }, 100)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    this.cleanup = () => canvas.removeEventListener('mousedown', onMouseDown)
  }

  stop() {
    if (this.cleanup) {
      this.cleanup()
      this.cleanup = null
    }
    this.cursorUI.setTransform('')
  }
}

export default ClickEffectAnimation
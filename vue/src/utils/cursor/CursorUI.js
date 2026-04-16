class CursorUI {
  constructor() {
    this.element = null
    this.currentWidth = 64
    this.currentHeight = 64
    this.lastMousePos = { x: 0, y: 0 }
    this.init()
  }

  init() {
    this.element = document.createElement('div')
    this.element.className = 'custom-cursor'
    document.body.appendChild(this.element)
    this.hide()
  }

  setImage(imagePath, width, height) {
    this.currentWidth = width
    this.currentHeight = height
    this.element.style.backgroundImage = `url(${imagePath})`
    this.element.style.width = `${width}px`
    this.element.style.height = `${height}px`
  }

  setPosition(x, y) {
    this.lastMousePos = { x, y }
    const halfWidth = this.currentWidth / 2
    const halfHeight = this.currentHeight / 2
    this.element.style.left = `${x - halfWidth}px`
    this.element.style.top = `${y - halfHeight}px`
  }

  show() {
    this.element.style.display = 'block'
  }

  hide() {
    this.element.style.display = 'none'
  }

  setTransform(transform) {
    this.element.style.transform = transform
  }

  destroy() {
    if (this.element) {
      this.element.remove()
    }
  }
}

export default CursorUI
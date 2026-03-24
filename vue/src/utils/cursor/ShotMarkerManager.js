class ShotMarkerManager {
  constructor() {
    this.markers = []
  }

  create(x, y) {
    const marker = document.createElement('div')
    marker.style.position = 'fixed'
    marker.style.width = '20px'
    marker.style.height = '20px'
    marker.style.borderRadius = '50%'
    marker.style.backgroundColor = 'rgba(255, 100, 100, 0.8)'
    marker.style.boxShadow = '0 0 10px rgba(255, 100, 100, 0.8)'
    marker.style.pointerEvents = 'none'
    marker.style.zIndex = '1000'
    marker.style.transition = 'opacity 0.2s ease'
    marker.style.left = `${x - 10}px`
    marker.style.top = `${y - 10}px`

    document.body.appendChild(marker)
    this.markers.push(marker)

    setTimeout(() => {
      marker.style.opacity = '0'
      setTimeout(() => {
        marker.remove()
        const index = this.markers.indexOf(marker)
        if (index > -1) this.markers.splice(index, 1)
      }, 200)
    }, 2000)
  }

  clearAll() {
    this.markers.forEach(marker => marker.remove())
    this.markers = []
  }
}

export default ShotMarkerManager
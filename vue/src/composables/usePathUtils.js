export const usePathUtils = () => {
  const isPointOnPath = (x, y, path) => {
    let minDistance = Infinity

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i]
      const p2 = path[i + 1]

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.hypot(dx, dy)
      if (!len) continue

      const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len)
      const clamped = Math.max(0, Math.min(1, t))

      const px = p1.x + clamped * dx
      const py = p1.y + clamped * dy

      const dist = Math.hypot(x - px, y - py)
      minDistance = Math.min(minDistance, dist)
    }

    return minDistance <= 22
  }

  const calculatePathPoints = (path) => {
    if (!path.length) return ''

    const width = 25
    const points = []

    for (let i = 0; i < path.length; i++) {
      const p = path[i]

      let prevDir = { x: 0, y: 0 }
      if (i > 0) {
        const prev = path[i - 1]
        const len = Math.hypot(p.x - prev.x, p.y - prev.y)
        if (len) {
          prevDir.x = (p.x - prev.x) / len
          prevDir.y = (p.y - prev.y) / len
        }
      }

      let nextDir = { x: 0, y: 0 }
      if (i < path.length - 1) {
        const next = path[i + 1]
        const len = Math.hypot(next.x - p.x, next.y - p.y)
        if (len) {
          nextDir.x = (next.x - p.x) / len
          nextDir.y = (next.y - p.y) / len
        }
      }

      let dir = { x: 0, y: 0 }
      if (i === 0) dir = nextDir
      else if (i === path.length - 1) dir = prevDir
      else {
        dir.x = (prevDir.x + nextDir.x) / 2
        dir.y = (prevDir.y + nextDir.y) / 2
        const len = Math.hypot(dir.x, dir.y)
        if (len) {
          dir.x /= len
          dir.y /= len
        }
      }

      const perp = { x: -dir.y, y: dir.x }

      points.unshift({ x: p.x + perp.x * width, y: p.y + perp.y * width })
      points.push({ x: p.x - perp.x * width, y: p.y - perp.y * width })
    }

    return points.map(p => `${p.x},${p.y}`).join(' ')
  }

  return { isPointOnPath, calculatePathPoints }
}
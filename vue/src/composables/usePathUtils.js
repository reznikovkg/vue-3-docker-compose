export const isPointOnPath = (x, y, path) => {
  let minDistance = Infinity

  path.forEach((p1, i) => {
    if (i >= path.length - 1) 
      return
    const p2 = path[i + 1]

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.hypot(dx, dy)
    if (len > 0) {
      const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len)
      const clamped = Math.max(0, Math.min(1, t))

      const px = p1.x + clamped * dx
      const py = p1.y + clamped * dy

      const dist = Math.hypot(x - px, y - py)
      minDistance = Math.min(minDistance, dist)
    }
  })

  return minDistance <= 22
}

const normalize = (x, y) => {
  const len = Math.hypot(x, y)
  return len ? { x: x / len, y: y / len } : { x: 0, y: 0 }
}

export const calculatePathPoints = (path) => {
  if (!path.length) 
    return ''

  const width = 25
  const points = []

  path.forEach((p, i) => {
    const prev = path[i - 1]
    const next = path[i + 1]

    const prevDir = prev ? normalize(p.x - prev.x, p.y - prev.y) : { x: 0, y: 0 }
    const nextDir = next ? normalize(next.x - p.x, next.y - p.y) : { x: 0, y: 0 }

    let dir
    if (!prev) 
      dir = nextDir
    else if (!next) 
      dir = prevDir
    else 
      dir = normalize(prevDir.x + nextDir.x, prevDir.y + nextDir.y)

    const perp = { x: -dir.y, y: dir.x }

    points.unshift({ x: p.x + perp.x * width, y: p.y + perp.y * width })
    points.push({ x: p.x - perp.x * width, y: p.y - perp.y * width })
  })

  return points.map(p => `${p.x},${p.y}`).join(' ')
}
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
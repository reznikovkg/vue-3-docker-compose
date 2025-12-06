const data = {
  polygon: []
}

const cross = (ax, ay, bx, by) => {
  return ax * by - ay * bx
}

const dist = (a, b) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

const equalPoints = (p1, p2) => {
  return Math.abs(p1.x - p2.x) < 0.001 && Math.abs(p1.y - p2.y) < 0.001
}


const orientation = (a, b, c) => {
  return cross(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y)
}

const pointOnSegment = (p, a, b, eps = 1e-9) => {
  const cr = orientation(a, b, p)
  if (Math.abs(cr) > eps) {
    return false
  }
  const minX = Math.min(a.x, b.x) - eps
  const maxX = Math.max(a.x, b.x) + eps
  const minY = Math.min(a.y, b.y) - eps
  const maxY = Math.max(a.y, b.y) + eps
  return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
}

const pointInPolygon = (point) => {
  const polygon = data.polygon
  let inside = false
  const x = point.x
  const y = point.y
  const n = polygon.length

  for (let i = 0; i < n; i++) {
    const pi = polygon[i]
    const pj = polygon[(i + 1) % n]

    if (pointOnSegment(point, pi, pj)) {
      return true
    }

    const intersect = ((pi.y > y) !== (pj.y > y)) &&
        (x < (pj.x - pi.x) * (y - pi.y) / (pj.y - pi.y) + pi.x)

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

const segmentPositionY = (x, segment) => {
  let { a, b }= segment
  if(a.x > b.x) {
    [a, b] = [b, a]
  }
  if(a.x >= x) {
    return a.y
  }
  if(b.x < x) {
    return b.y
  }
  const t = (x - a.x) / (b.x - a.x)
  return a.y + (b.y - a.y) * t
}

const segmentsProperlyIntersect = (p1, p2, q1, q2) => {
  const o1 = orientation(p1, p2, q1)
  const o2 = orientation(p1, p2, q2)
  const o3 = orientation(q1, q2, p1)
  const o4 = orientation(q1, q2, p2)

  return o1 * o2 < 0 && o3 * o4 < 0
}

const segmentsProperlyIntersectWithOn = (p1, p2, q1, q2) => {
  const o1 = orientation(p1, p2, q1)
  const o2 = orientation(p1, p2, q2)
  const o3 = orientation(q1, q2, p1)
  const o4 = orientation(q1, q2, p2)

  return o1 * o2 <= 0 && o3 * o4 <= 0
}

const segmentInsidePolygon = (p, q) => {
  if (!pointInPolygon(p) || !pointInPolygon(q)) {
    return false
  }

  const n = data.polygon.length
  for (let i = 0; i < n; i++) {
    const a = data.polygon[i]
    const b = data.polygon[(i + 1) % n]

    if (
        !equalPoints(p, a)
        && !equalPoints(p, b)
        && !equalPoints(q, a)
        && !equalPoints(q, b)
        && segmentsProperlyIntersect(p, q, a, b)
    ) {
      return false
    }
  }

  const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
  return pointInPolygon(mid);
}

const makePoint = (p) => ({
  x: Number(p.x),
  y: Number(p.y)
})

const dijkstra = (adj, start, target) => {
  const n = adj.length
  const distArr = Array(n).fill(Infinity)
  const visited = Array(n).fill(false)
  const prev = Array(n).fill(-1)

  distArr[start] = 0

  for (let iter = 0; iter < n; iter++) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < n; i++) {
      if (!visited[i] && distArr[i] < best) {
        best = distArr[i]
        u = i
      }
    }

    if (u === -1 || u === target) {
      break
    }

    visited[u] = true

    for (const edge of adj[u]) {
      const v = edge.to
      const w = edge.w
      const nd = distArr[u] + w
      if (nd < distArr[v]) {
        distArr[v] = nd
        prev[v] = u
      }
    }
  }

  const path = []
  let cur = target
  if (prev[cur] === -1 && cur !== start) {
    return []
  }
  while (cur !== -1) {
    path.push(cur)
    cur = prev[cur]
  }
  path.reverse()
  return path
}

const buildVisibilityGraph = (A, B) => {
  const points = []
  const len = data.polygon.length
  for(let i = 0; i < len; i++) {
    const a = data.polygon[i]
    const b = data.polygon[(i + 1) % len]
    const c = data.polygon[(i - 1 + len) % len]
    if (orientation(a, b, c) < 0) {
      points.push(data.polygon[i])
    }
  }


  const nodes = [
    makePoint(A),
    makePoint(B),
    ...points.map(makePoint)
  ]
  const n = nodes.length
  const adj = Array.from({ length: n }, () => [])

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p = nodes[i]
      const q = nodes[j]
      if (segmentInsidePolygon(p, q)) {
        const w = dist(p, q)
        adj[i].push({ to: j, w })
        adj[j].push({ to: i, w })
      }
    }
  }

  return { nodes, adj }
}

const setArea = (poly) => {
  data.polygon = poly
}

const closestPointOnSegment = (p, edge) => {
  const { a, b } = edge
  const ABx = b.x - a.x;
  const ABy = b.y - a.y;
  const APx = p.x - a.x;
  const APy = p.y - a.y;

  const abLenSq = ABx * ABx + ABy * ABy;
  if (abLenSq === 0) {
    return { x: a.x, y: a.y };
  }

  let t = (APx * ABx + APy * ABy) / abLenSq;

  if (t < 0) {
    t = 0;
  } else if (t > 1) {
    t = 1;
  }

  return {
    x: a.x + t * ABx,
    y: a.y + t * ABy,
  };
}

const findClosestPoint = (point) => {
  if (pointInPolygon(point)) {
    return point
  }

  const edges = []
  const n = data.polygon.length

  for (let i = 0; i < n; i++) {
    const i2 = (i + 1) % n
    if (segmentsProperlyIntersectWithOn(
      data.polygon[i],
      data.polygon[i2],
      { x: point.x, y: 0},
      { x: point.x, y: 600 })
    ) {
      edges.push({ a: data.polygon[i], b: data.polygon[i2] })
    }
  }

  let minDist = dist(data.polygon[0], point)
  let index = 0

  if (edges.length === 0) {
    for (let i = 0; i < n; i++) {
      const distance = dist(data.polygon[i], point)
      if (distance < minDist) {
        minDist = distance
        index = i
      }
    }
    if (
        dist(data.polygon[index - 1], point) > dist(data.polygon[(index + 1) % n], point)
    ) {
      return closestPointOnSegment(
          point,
          {
            a: data.polygon[index],
            b: data.polygon[(index + 1) % n]
          })
    }
    return closestPointOnSegment(
        point,
        {
          a: data.polygon[index - 1],
          b: data.polygon[index]
        })
  }

  return edges.map(edge => {
    return {
      x: point.x,
      y: segmentPositionY(point.x, edge)
    }
  }).toSorted((a, b) =>
      Math.abs(a.y - point.y) - Math.abs(b.y - point.y)
  )[0]
}

const findShortestPath = (startPoint, endPoint) => {
  if (!data.polygon || data.polygon.length === 0) {
    return [makePoint(startPoint), makePoint(endPoint)]
  }

  const a = makePoint(findClosestPoint(startPoint))
  const b = makePoint(findClosestPoint(endPoint))

  if (!pointInPolygon(a) || !pointInPolygon(b)) {
    return [a, b]
  }

  if (segmentInsidePolygon(a, b)) {
    return [a, b]
  }

  const { nodes, adj } = buildVisibilityGraph(a, b)
  const idxPath = dijkstra(adj, 0, 1)

  if (idxPath.length === 0) {
    return [a, b]
  }

  return idxPath.map(i => ({ x: nodes[i].x, y: nodes[i].y }))
}

export default {
  setArea,
  pointInPolygon,
  findShortestPath
}

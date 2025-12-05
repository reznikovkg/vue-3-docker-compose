const data = {
  triangles: [],
  graph: {}
}

const cross = (ax, ay, bx, by) => ax * by - ay * bx

const dist = (a, b) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

const sub = (point1, point2) => ({ x: point1.x - point2.x, y: point1.y - point2.y })

const dot = (point1, point2) => point1.x * point2.x + point1.y * point2.y

const signedArea = (poly) => {
  let area = 0
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += poly[i].x * poly[j].y - poly[j].x * poly[i].y
  }
  return area * 0.5
}

const isConvex = (triangle) => {
  const crossVal = cross(
      triangle.b.x - triangle.a.x, triangle.b.y - triangle.a.y,
      triangle.c.x - triangle.b.x, triangle.c.y - triangle.b.y
  )
  return crossVal > 0.0001
}

const pointInTriangle = (point, triangle) => {
  const a = triangle.a
  const b = triangle.b
  const c = triangle.c

  const c1 = cross(b.x - a.x, b.y - a.y, point.x - a.x, point.y - a.y)
  const c2 = cross(c.x - b.x, c.y - b.y, point.x - b.x, point.y - b.y)
  const c3 = cross(a.x - c.x, a.y - c.y, point.x - c.x, point.y - c.y)

  const hasNeg = (c1 < 0) || (c2 < 0) || (c3 < 0)
  const hasPos = (c1 > 0) || (c2 > 0) || (c3 > 0)

  return !(hasNeg && hasPos)
}

const equalPoints = (point1, point2) =>
    Math.abs(point1.x - point2.x) < 0.001 && Math.abs(point1.y - point2.y) < 0.001

const sameEdge = (triangle1, triangle2) => {
  const edges1 = [[triangle1.a, triangle1.b], [triangle1.b, triangle1.c], [triangle1.c, triangle1.a]]
  const edges2 = [[triangle2.a, triangle2.b], [triangle2.b, triangle2.c], [triangle2.c, triangle2.a]]

  let found = false
  let i = 0

  while (i < edges1.length && !found) {
    const e1 = edges1[i]
    let j = 0

    while (j < edges2.length && !found) {
      const e2 = edges2[j]
      const same =
          (equalPoints(e1[0], e2[0]) && equalPoints(e1[1], e2[1])) ||
          (equalPoints(e1[0], e2[1]) && equalPoints(e1[1], e2[0]))

      if (same) {
        found = true
      } else {
        j += 1
      }
    }

    if (!found) {
      i += 1
    }
  }
  return found
}

const buildTriangleGraph = (triangles) => {
  const neighbors = triangles.map(() => [])

  for (let i = 0; i < triangles.length; i++) {
    for (let j = i + 1; j < triangles.length; j++) {
      if (sameEdge(triangles[i], triangles[j])) {
        neighbors[i].push(j)
        neighbors[j].push(i)
      }
    }
  }

  return neighbors
}

const closestPointInTriangle = (point, triangle) => {
  const ab = sub(triangle.b, triangle.a)
  const ac = sub(triangle.c, triangle.a)
  const ap = sub(point, triangle.a)

  const d1 = dot(ab, ap)
  const d2 = dot(ac, ap)

  if (d1 <= 0 && d2 <= 0) {
    return triangle.a
  }

  const bp = sub(point, triangle.b)
  const d3 = dot(ab, bp)
  const d4 = dot(ac, bp)

  if (d3 >= 0 && d4 <= d3) {
    return triangle.b
  }

  const vc = d1 * d4 - d3 * d2
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3)
    return {
      x: triangle.a.x + v * (triangle.b.x - triangle.a.x),
      y: triangle.a.y + v * (triangle.b.y - triangle.a.y),
    }
  }

  const cp = sub(point, triangle.c)
  const d5 = dot(ab, cp)
  const d6 = dot(ac, cp)

  if (d6 >= 0 && d5 <= d6) {
    return triangle.c
  }

  const vb = d5 * d2 - d1 * d6
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6)
    return {
      x: triangle.a.x + w * (triangle.c.x - triangle.a.x),
      y: triangle.a.y + w * (triangle.c.y - triangle.a.y),
    }
  }

  const va = d3 * d6 - d5 * d4
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6))
    return {
      x: triangle.b.x + w * (triangle.c.x - triangle.b.x),
      y: triangle.b.y + w * (triangle.c.y - triangle.b.y),
    }
  }

  const denominator = 1 / (va + vb + vc)
  const v = vb * denominator
  const w = vc * denominator

  return {
    x: triangle.a.x + ab.x * v + ac.x * w,
    y: triangle.a.y + ab.y * v + ac.y * w,
  }
}

const findEarIndex = (poly, indices) => {
  let earIndex = -1
  let i = 0

  while (i < indices.length && earIndex === -1) {
    const i0 = indices[(i - 1 + indices.length) % indices.length]
    const i1 = indices[i]
    const i2 = indices[(i + 1) % indices.length]

    const a = poly[i0]
    const b = poly[i1]
    const c = poly[i2]

    let isEar = false

    if (isConvex({a, b, c})) {
      let hasPointInside = false
      let j = 0

      while (j < indices.length && !hasPointInside) {
        const idx = indices[j]
        const isVertex = (idx === i0 || idx === i1 || idx === i2)

        if (!isVertex) {
          if (pointInTriangle(poly[idx], {a, b, c})) {
            hasPointInside = true
          }
        }

        j += 1
      }

      isEar = !hasPointInside
    }

    if (isEar) {
      earIndex = i
    } else {
      i += 1
    }
  }

  return earIndex
}
const setArea = (polies) => {
  data.triangles = []
  polies.forEach(poly => {
    data.triangles = data.triangles.concat(triangulate(poly))
  })
  data.graph = buildTriangleGraph(data.triangles)
}

const triangulate = (poly) => {
  const result = []
  if (!poly || poly.length < 3) {
    return result
  }

  if (signedArea(poly) < 0) {
    poly = poly.slice().reverse()
  }

  let indices = Array.from({ length: poly.length }, (_, i) => i)

  let guard = 0
  const maxGuard = 10000
  let stop = false


  while (indices.length > 3 && guard < maxGuard && !stop) {
    const earIndex = findEarIndex(poly, indices)

    if (earIndex === -1) {
      stop = true
    } else {
      const i0 = indices[(earIndex - 1 + indices.length) % indices.length]
      const i1 = indices[earIndex]
      const i2 = indices[(earIndex + 1) % indices.length]

      const a = poly[i0]
      const b = poly[i1]
      const c = poly[i2]

      result.push({ a, b, c })
      indices.splice(earIndex, 1)
      guard += 1
    }
  }

  if (indices.length === 3) {
    const a = poly[indices[0]]
    const b = poly[indices[1]]
    const c = poly[indices[2]]
    result.push({ a, b, c })
  }
  return result
}

const findShortestTrianglePath = (startPoint, endPoint) => {
  const triangles = data.triangles
  if (!triangles || triangles.length === 0) {
    return []
  }

  let startIndex = 0
  let minDist = dist(closestPointInTriangle(startPoint, triangles[0]), startPoint)

  for (let i = 1; i < triangles.length; i++) {
    const point = closestPointInTriangle(startPoint, triangles[i])
    const distance = dist(startPoint, point)
    if (distance < minDist) {
      minDist = distance
      startIndex = i
    }
  }

  let endIndex = -1
  minDist = Number.POSITIVE_INFINITY

  for (let i = 0; i < triangles.length; i++) {
    const pointB = closestPointInTriangle(endPoint, triangles[i])
    const distance = dist(pointB, endPoint)
    const minX = Math.min(triangles[i].a.x, triangles[i].b.x, triangles[i].c.x)
    const maxX = Math.max(triangles[i].a.x, triangles[i].b.x, triangles[i].c.x)
    const inXRange = (minX < endPoint.x && endPoint.x < maxX)

    if (distance < minDist && inXRange) {
      minDist = distance
      endIndex = i
    }
  }

  if(endIndex === -1) {
    for (let i = 0; i < triangles.length; i++) {
      const pointB = closestPointInTriangle(endPoint, triangles[i])
      const distance = dist(pointB, endPoint)
      if (distance < minDist) {
        minDist = distance
        endIndex = i
      }
    }
  }

  const queue = [startIndex]
  const cameFrom = {}
  cameFrom[startIndex] = null

  let qIndex = 0
  let reached = false

  while (qIndex < queue.length && !reached) {
    const current = queue[qIndex]
    const isTarget = (current === endIndex)

    if (isTarget) {
      reached = true
    } else {
      const neighbors = data.graph[current]
      let i = 0
      while (i < neighbors.length) {
        const next = neighbors[i]
        const seen = (next in cameFrom)
        if (!seen) {
          cameFrom[next] = current
          queue.push(next)
        }
        i += 1
      }
      qIndex += 1
    }
  }

  const pathTriangles = []
  let current = endIndex
  let valid = (current in cameFrom)

  while (valid) {
    pathTriangles.unshift(triangles[current])
    current = cameFrom[current]
    valid = (current !== null && current in cameFrom)
  }

  let path = []
  let lastPoint = endPoint

  let i = pathTriangles.length - 1

  const { a, b, c } = pathTriangles[i]
  const minX = Math.min(a.x, b.x, c.x)
  const maxX = Math.max(a.x, b.x, c.x)
  if (lastPoint.x > minX && lastPoint.x < maxX) {
    const intersect = intersectTriangleWithLine(
        pathTriangles[i],
        {
          p1: { x: lastPoint.x, y: 0 },
          p2: { x: lastPoint.x, y: 550 }
        })
    const minY = intersect.reduce((min, point) => point.y < min ? point.y : min, Number.POSITIVE_INFINITY )
    const maxY = intersect.reduce((max, point) => point.y > max ? point.y : max, 0 )
    if (lastPoint.y > maxY) {
      lastPoint.y = maxY
    } else if (lastPoint.y < minY) {
      lastPoint.y = minY
    }
  } else {
    lastPoint = closestPointInTriangle(lastPoint, pathTriangles[i])
  }
  path.push(lastPoint)
  i -= 1
  while (i >= 0) {
    lastPoint = getPathPoint(pathTriangles[i + 1], pathTriangles[i], lastPoint)
    path.push(lastPoint)
    i -= 1
  }

  path.reverse()
  return path
}

const getPathPoint = (tri1, tri2, point) => {
  const eq = (p1, p2) =>
      Math.abs(p1.x - p2.x) < 0.01 &&
      Math.abs(p1.y - p2.y) < 0.01;

  const t1 = [tri1.a, tri1.b, tri1.c];
  const t2 = [tri2.a, tri2.b, tri2.c];

  let common = [];
  for (let p1 of t1) {
    for (let p2 of t2) {
      if (eq(p1, p2)) common.push(p1);
    }
  }

  if (common.length !== 2) {
    throw new Error("Треугольники не имеют ровно одного общего ребра.");
  }

  const a = common[0];
  const b = common[1];
  const p = point;

  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: p.x - a.x, y: p.y - a.y };

  const ab2 = ab.x * ab.x + ab.y * ab.y;
  const t = (ab.x * ap.x + ab.y * ap.y) / ab2;

  const tClamped = Math.max(0, Math.min(1, t));

  return {
    x: a.x + ab.x * tClamped,
    y: a.y + ab.y * tClamped
  };
}


const pointInPolygon = (point) => {
  return triangles.reduce((result, triangle) => pointInTriangle(point, triangle) || result, false)
}

const segmentIntersection = (line1, line2) => {
  const a = line1.p1
  const b = line1.p2
  const c = line2.p1
  const d = line2.p2

  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)
  if (Math.abs(den) < 1e-9) {
    return null
  }

  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den
  const u = -((a.x - b.x) * (a.y - c.y) - (a.y - b.y) * (a.x - c.x)) / den

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: a.x + t * (b.x - a.x),
      y: a.y + t * (b.y - a.y)
    };
  }
  return null;
}

const intersectTriangleWithLine = (triangle, line) => {
  const { a, b, c } = triangle
  const edges = [[a, b], [b, c], [c, a]];
  const intersections = [];

  for (const [e1, e2] of edges) {
    const inter = segmentIntersection({ p1: e1, p2: e2 }, line);
    if (inter) intersections.push(inter);
  }

  return intersections;
}

export default {
  setArea,
  pointInPolygon,
  findShortestTrianglePath
}

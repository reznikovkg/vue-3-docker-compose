import { MUTATIONS } from '@/store/game/constants'

export const findClosestPathPointIndex = (entity, path) => {
  let minDist = Infinity
  let closestIndex = 0

  path.forEach((point, index) => {
    const dist = Math.hypot(entity.x - point.x, entity.y - point.y)
    if (dist < minDist) {
      minDist = dist
      closestIndex = index
    }
  })

  return closestIndex
}

export const moveAlongPath = (entity, deltaTime) => {
  if (!entity?.path?.length) 
    return false
  
  entity.speed = entity.speed || 0.05
  const moveDistance = entity.speed * deltaTime

  if (entity.currentTargetIndex === undefined || entity.currentTargetIndex >= entity.path.length) {
    entity.currentTargetIndex = findClosestPathPointIndex(entity, entity.path)
    entity.currentTarget = entity.path[entity.currentTargetIndex]
  }

  const target = entity.currentTarget
  if (!target) 
    return false

  const dx = target.x - entity.x
  const dy = target.y - entity.y
  const distance = Math.hypot(dx, dy)

  if (distance <= moveDistance) {
    entity.x = target.x
    entity.y = target.y
    entity.currentTargetIndex++

    if (entity.currentTargetIndex < entity.path.length) {
      entity.currentTarget = entity.path[entity.currentTargetIndex]
    }
  } else {
    const angle = Math.atan2(dy, dx)
    entity.x += Math.cos(angle) * moveDistance
    entity.y += Math.sin(angle) * moveDistance
  }
  
  return true
}

export const updateEnemies = (state, commit, deltaTime) => {
  if (!state.enemies?.length) 
    return
  
  const updated = state.enemies.map(enemy => {
    if (!enemy || enemy.isBlockedByBarricade || !enemy.path?.length) 
        return enemy
    
    if (enemy.currentTargetIndex === undefined || enemy.currentTargetIndex >= enemy.path.length) {
      enemy.currentTargetIndex = findClosestPathPointIndex(enemy, enemy.path)
      enemy.currentTarget = enemy.path[enemy.currentTargetIndex]
    }
    
    moveAlongPath(enemy, deltaTime)
    return enemy
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, updated)
}

export const updateAlliesMovement = (state, commit, deltaTime) => {
  const updated = state.allies.map(a => {
    const hasTarget = state.enemies.some(e => Math.hypot(a.x - e.x, a.y - e.y) <= (a.attackRange || 80))
    
    if (!hasTarget) 
        moveAlongPath(a, deltaTime)
    return a
  })
  
  commit(MUTATIONS.UPDATE_ALLIES, updated)
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
    
    points.unshift({
      x: p.x + perp.x * width,
      y: p.y + perp.y * width
    })
    
    points.push({
      x: p.x - perp.x * width,
      y: p.y - perp.y * width
    })
  })
  
  return points.map(p => `${p.x},${p.y}`).join(' ')
}
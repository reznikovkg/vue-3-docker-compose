const findClosestPathPointIndex = (entity, path) => {
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

export const moveEntity = (entity, deltaTime) => {
  if (!entity?.path?.length) {
    return entity
  }
  
  const speed = entity.speed || 0.05
  const moveDistance = speed * deltaTime
  
  let currentTargetIndex = entity.currentTargetIndex
  let currentTarget = entity.currentTarget
  let x = entity.x
  let y = entity.y
  
  if (currentTargetIndex === undefined || currentTargetIndex >= entity.path.length) {
    currentTargetIndex = findClosestPathPointIndex(entity, entity.path)
    currentTarget = entity.path[currentTargetIndex]
  }
  
  if (!currentTarget) {
    return entity
  }
  
  const dx = currentTarget.x - x
  const dy = currentTarget.y - y
  const distance = Math.hypot(dx, dy)
  
  if (distance <= moveDistance) {
    x = currentTarget.x
    y = currentTarget.y
    currentTargetIndex++
    
    if (currentTargetIndex < entity.path.length) {
      currentTarget = entity.path[currentTargetIndex]
    }
  } else {
    const angle = Math.atan2(dy, dx)
    x += Math.cos(angle) * moveDistance
    y += Math.sin(angle) * moveDistance
  }
  
  return {
    ...entity,
    x,
    y,
    currentTargetIndex,
    currentTarget
  }
}

export const processEnemyMovement = (enemies, barricades, deltaTime) => {
  return enemies.map(enemy => {
    const isBlocked = barricades.some(b => Math.hypot(enemy.x - b.x, enemy.y - b.y) < 30)
    
    if (isBlocked || !enemy.path?.length) {
      return {
        ...enemy,
        isBlockedByBarricade: isBlocked
      }
    }
    
    return moveEntity(enemy, deltaTime)
  })
}

export const processAlliesMovement = (allies, enemies, deltaTime) => {
  return allies.map(ally => {
    const hasTarget = enemies.some(e => 
      Math.hypot(ally.x - e.x, ally.y - e.y) <= (ally.attackRange || 80)
    )
    
    if (hasTarget) {
      return ally
    }
    
    return moveEntity(ally, deltaTime)
  })
}

const normalize = (x, y) => {
  const len = Math.hypot(x, y)
  return len ? { x: x / len, y: y / len } : { x: 0, y: 0 }
}

export const calculatePathPoints = (path) => {
  if (!path.length) {
    return ''
  }
  
  const width = 25
  const points = []
  
  path.forEach((p, i) => {
    const prev = path[i - 1]
    const next = path[i + 1]
    
    const prevDir = prev ? normalize(p.x - prev.x, p.y - prev.y) : { x: 0, y: 0 }
    const nextDir = next ? normalize(next.x - p.x, next.y - p.y) : { x: 0, y: 0 }
    
    let dir
    if (!prev) {
      dir = nextDir
    } else if (!next) {
      dir = prevDir
    } else {
      dir = normalize(prevDir.x + nextDir.x, prevDir.y + nextDir.y)
    }
    
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
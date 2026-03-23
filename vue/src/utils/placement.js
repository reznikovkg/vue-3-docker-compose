import { createTower } from './entities'

export const hasEnoughPoints = (points, cost) => {
  return points >= cost
}

export const buildTower = (towers, pos) => {
  const existingTower = towers.find(t => t.positionId === pos.id)
  
  if (!existingTower) {
    return {
      action: 'build',
      tower: createTower(pos)
    }
  } else {
    return {
      action: 'select',
      positionId: pos.id
    }
  }
}

export const canPlaceBarricade = (point, currentPath, barricades, towers) => {
  if (!currentPath?.length) {
    return false
  }
  
  const threshold = 30
  let onPath = false
  
  currentPath.slice(0, -1).some((start, i) => {
    const end = currentPath[i + 1]
    
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    
    if (length === 0) {
      return false
    }
    
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)
    
    if (t >= 0 && t <= 1) {
      const closestX = start.x + t * dx
      const closestY = start.y + t * dy
      
      if (Math.hypot(point.x - closestX, point.y - closestY) <= threshold) {
        onPath = true
        return true
      }
    }
    
    return false
  })
  
  if (!onPath) {
    return false
  }
  
  const isTaken = barricades.some(b => Math.hypot(b.x - point.x, b.y - point.y) < 40)
  const isOnTower = towers.some(t => Math.hypot(t.x - point.x, t.y - point.y) < 30)
  
  return !isTaken && !isOnTower
}

export const canPlaceArtillery = (point, currentPath) => {
  if (!currentPath?.length) {
    return false
  }
  
  const threshold = 30
  
  return currentPath.slice(0, -1).some((start, i) => {
    const end = currentPath[i + 1]
    
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    
    if (length === 0) {
      return false
    }
    
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)
    
    if (t >= 0 && t <= 1) {
      const closestX = start.x + t * dx
      const closestY = start.y + t * dy
      
      if (Math.hypot(point.x - closestX, point.y - closestY) <= threshold) {
        return true
      }
    }
    
    return false
  })
}
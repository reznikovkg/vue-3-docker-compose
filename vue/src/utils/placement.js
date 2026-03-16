import { COSTS, MUTATIONS } from '@/store/game/constants'
import { createTower } from './entities'

export const hasEnoughPoints = (state, commit, cost) => {
  if (state.points >= cost) {
    return true
  }

  commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, true)

  setTimeout(() => {
    commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, false)
  }, 2000)

  return false
}

export const buildTower = (state, commit, pos) => {
  const existingTower = state.towers.find(t => t.positionId === pos.id)

  if (!existingTower) {
    if (!hasEnoughPoints(state, commit, COSTS.TOWER)) 
        return

    commit(MUTATIONS.REMOVE_POINTS, COSTS.TOWER)
    commit(MUTATIONS.ADD_TOWER, createTower(pos))
    commit(MUTATIONS.SET_SELECTED_TOWER, null)
  } else {
    commit(MUTATIONS.SET_SELECTED_TOWER, pos.id)
  }
}

export const canPlaceBarricade = (state, point) => {
  if (!state.currentPath?.length) 
    return false
  
  const threshold = 30
  let onPath = false
  
  state.currentPath.slice(0, -1).some((start, i) => {
    const end = state.currentPath[i + 1]
    
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    
    if (length === 0) 
        return false
    
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
  
  if (!onPath) 
    return false
  
  const isTaken = state.barricades.some(b => Math.hypot(b.x - point.x, b.y - point.y) < 40)
  const isOnTower = state.towers.some(t => Math.hypot(t.x - point.x, t.y - point.y) < 30)
  
  return !isTaken && !isOnTower
}
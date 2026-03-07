import { updateTowers } from './useTowerCombat'

export const createGameLoop = (ctx) => {
  let intervalId = null
  let lastUpdate = Date.now()

  const startLoop = () => {
    if (intervalId) 
        return
    intervalId = setInterval(() => {

      const now = Date.now()
      const deltaTime = now - lastUpdate
      lastUpdate = now  

      if (ctx.gameOver || ctx.victory) return

      updateEnemies(ctx, deltaTime)
      updateTowers(ctx)
      ctx.checkEnemiesAtEnd?.()
    }, 50)
  }

  const stopLoop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { startLoop, stopLoop }
}

const updateEnemies = (ctx, deltaTime) => {
  ctx.enemies.forEach(enemy => {
    if (!enemy.path || enemy.path.length === 0) 
      return

    const moveDistance = enemy.speed * deltaTime

    if (
      enemy.currentTargetIndex === undefined ||
      enemy.currentTargetIndex >= enemy.path.length
    ) {
      enemy.currentTargetIndex = findClosestPathPointIndex(enemy, enemy.path)
      enemy.currentTarget = enemy.path[enemy.currentTargetIndex]
    }

    const target = enemy.currentTarget
    if (!target) 
      return

    const dx = target.x - enemy.x
    const dy = target.y - enemy.y
    const distance = Math.hypot(dx, dy)

    if (distance <= moveDistance) {
      enemy.x = target.x
      enemy.y = target.y
      enemy.currentTargetIndex++

      if (enemy.currentTargetIndex < enemy.path.length) {
        enemy.currentTarget = enemy.path[enemy.currentTargetIndex]
      }
    } else {
      const angle = Math.atan2(dy, dx)
      enemy.x += Math.cos(angle) * moveDistance
      enemy.y += Math.sin(angle) * moveDistance
    }
  })
}

const findClosestPathPointIndex = (enemy, path) => {
  let minDist = Infinity
  let closestIndex = 0

  path.forEach((point, index) => {
    const dist = Math.hypot(enemy.x - point.x, enemy.y - point.y)
    if (dist < minDist) {
      minDist = dist
      closestIndex = index
    }
  })

  return closestIndex
}
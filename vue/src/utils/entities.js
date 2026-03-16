import { MUTATIONS } from '@/store/game/constants'

const getRandomEnemyType = (state) => {
  const level = state.levels.find(l => l.id === state.currentLevelId)
  
  if (!level?.enemyTypes?.length) {
    return {
      type: 'medium',
      health: 100,
      reward: 50,
      speed: 0.08,
      color: '#FF9800'
    }
  }
  
  const rand = Math.random()
  let cumulative = 0
  
  const selectedType = level.enemyTypes.find(enemyType => {
    cumulative += enemyType.chance
    return rand < cumulative
  }) || level.enemyTypes[0]
  
  return {
    type: selectedType.type,
    health: selectedType.health,
    reward: selectedType.reward,
    speed: selectedType.speed,
    color: selectedType.color,
    shootDamage: selectedType.shootDamage,
    shootRange: selectedType.shootRange,
    shootCooldown: selectedType.shootCooldown
  }
}

export const createEnemy = (state, level) => {
  const config = getRandomEnemyType(state)
  const path = level.path.map(p => ({ x: p.x, y: p.y }))
  
  const enemy = {
    id: Date.now() + Math.random(),
    x: level.path[0].x,
    y: level.path[0].y,
    health: config.health,
    maxHealth: config.health,
    type: config.type,
    color: config.color,
    reward: config.reward,
    path,
    currentTargetIndex: 1,
    currentTarget: path[1] || path[0],
    speed: config.speed
  }
  
  if (config.type === 'shooter') {
    enemy.shootDamage = config.shootDamage || 15
    enemy.shootRange = config.shootRange || 90
    enemy.shootCooldown = config.shootCooldown || 1000
    enemy.lastShotTime = 0
    enemy.isShooting = false
  }
  
  return enemy
}

export const createTower = (pos) => ({
  positionId: pos.id,
  x: pos.x,
  y: pos.y,
  level: 1,
  damage: 4,
  radius: 70,
  attackSpeed: 1,
  health: 80,
  maxHealth: 80,
  kills: 0,
  cooldown: 0,
  isHit: false
})

export const spawnEnemy = (state, commit, level) => {
  if (state.enemiesSpawned >= state.maxEnemies || state.gameOver || state.victory) 
    return
  commit(MUTATIONS.ADD_ENEMY, createEnemy(state, level))
}

export const checkVictoryCondition = (state, commit) => {
  if (
    !state.enemies.length &&
    state.enemiesSpawned >= state.maxEnemies &&
    !state.gameOver &&
    !state.victory
  ) {
    commit(MUTATIONS.SET_VICTORY, true)
  }
}

export const checkEnemiesAtEnd = (state, commit) => {
  const atEnd = state.enemies.some(e => {
    if (!e.path?.length) 
        return false
    
    const last = e.path[e.path.length - 1]
    return Math.hypot(e.x - last.x, e.y - last.y) < 5
  })
  
  if (atEnd) {
    commit(MUTATIONS.SET_GAME_OVER, true)
    commit(MUTATIONS.UPDATE_ENEMIES, [])
  }
}

export const checkAlliesAtEnd = (state, commit) => {
  commit(
    MUTATIONS.UPDATE_ALLIES,
    state.allies.filter(a => {
      if (!a.path?.length) 
        return true
      
      const last = a.path[a.path.length - 1]
      return Math.hypot(a.x - last.x, a.y - last.y) >= 5
    })
  )
}
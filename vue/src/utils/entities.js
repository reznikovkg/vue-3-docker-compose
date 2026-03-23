import { ENEMY_TYPES } from '@/constants/levels'

const getRandomEnemyType = (level) => {
  if (!level?.enemyTypes?.length) {
    return { ...ENEMY_TYPES.medium }
  }
  
  const rand = Math.random()
  let cumulative = 0
  
  const selectedType = level.enemyTypes.find(enemyType => {
    cumulative += enemyType.chance
    return rand < cumulative
  }) || level.enemyTypes[0]
  
  return { ...ENEMY_TYPES[selectedType.type] }
}

export const createEnemy = (level) => {
  const config = getRandomEnemyType(level)
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
    enemy.shootDamage = config.shootDamage
    enemy.shootRange = config.shootRange
    enemy.shootCooldown = config.shootCooldown
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

export const checkVictoryCondition = (enemies, enemiesSpawned, maxEnemies, gameOver, victory) => {
  if (!enemies.length && enemiesSpawned >= maxEnemies && !gameOver && !victory) {
    return true
  }
  return false
}

export const checkEnemiesAtEnd = (enemies) => {
  return enemies.some(e => {
    if (!e.path?.length) 
      return false
    const last = e.path[e.path.length - 1]
    return Math.hypot(e.x - last.x, e.y - last.y) < 5
  })
}

export const checkAlliesAtEnd = (allies) => {
  return allies.filter(a => {
    if (!a.path?.length) 
      return true
    const last = a.path[a.path.length - 1]
    return Math.hypot(a.x - last.x, a.y - last.y) >= 5
  })
}

export const canSpawnEnemy = (enemiesSpawned, maxEnemies, gameOver, victory) => {
  return enemiesSpawned < maxEnemies && !gameOver && !victory
}
export const findClosestInRange = (source, targets, range) => {
  const inRange = targets.filter(target => {
    if (!target || target.health <= 0) 
      return false
    const distance = Math.hypot(source.x - target.x, source.y - target.y)
    return distance <= range
  })
  
  if (inRange.length === 0) 
    return null
  
  return inRange.reduce((closest, current) => {
    const distToCurrent = Math.hypot(source.x - current.x, source.y - current.y)
    const distToClosest = closest ? Math.hypot(source.x - closest.x, source.y - closest.y) : Infinity
    return distToCurrent < distToClosest ? current : closest
  }, null)
}

export const createShot = (source, target, type) => ({
  id: Date.now() + Math.random(),
  x1: source.x,
  y1: source.y,
  length: Math.hypot(target.x - source.x, target.y - source.y),
  angle: Math.atan2(target.y - source.y, target.x - source.x),
  type
})

export const processTowerAttacks = (towers, enemies, now) => {
  const updatedTowers = []
  const updatedEnemies = enemies.map(e => ({ ...e }))
  const newShots = []
  const killedEnemies = []
  
  towers.forEach(tower => {
    let cooldown = tower.cooldown || 0
    let kills = tower.kills || 0
    
    cooldown = Math.max(0, cooldown - 100)
    
    if (cooldown <= 0) {
      const target = updatedEnemies.find(e => 
        e.health > 0 && Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.radius
      )
      
      if (target) {
        target.health -= tower.damage
        cooldown = 1000 / tower.attackSpeed
        
        newShots.push(createShot(tower, target, 'tower'))
        
        if (target.health <= 0) {
          kills++
          killedEnemies.push(target)
        }
      }
    }
    
    updatedTowers.push({
      ...tower,
      cooldown,
      kills
    })
  })
  
  const finalEnemies = updatedEnemies.filter(e => e.health > 0)
  
  return {
    towers: updatedTowers,
    enemies: finalEnemies,
    newShots,
    killedEnemies
  }
}

export const processShooterAttacks = (enemies, towers, allies, now) => {
  const updatedEnemies = []
  const updatedTowers = [...towers]
  const updatedAllies = [...allies]
  const newShots = []
  const hitTowerIds = []
  
  enemies.forEach(enemy => {
    if (enemy.type !== 'shooter') {
      updatedEnemies.push(enemy)
      return
    }
    
    const shooter = { ...enemy }
    shooter.shootCooldown = shooter.shootCooldown || 1000
    shooter.lastShotTime = shooter.lastShotTime || 0
    shooter.shootDamage = shooter.shootDamage || 15
    shooter.shootRange = shooter.shootRange || 90
    shooter.isShooting = false
    
    if (now - shooter.lastShotTime >= shooter.shootCooldown) {
      const targets = [...updatedTowers, ...updatedAllies]
      const target = findClosestInRange(shooter, targets, shooter.shootRange)
      
      if (target) {
        target.health -= shooter.shootDamage
        shooter.lastShotTime = now
        shooter.isShooting = true
        
        newShots.push(createShot(shooter, target, 'shooter'))
        
        if (target.positionId) {
          hitTowerIds.push(target.positionId)
        }
      }
    }
    
    updatedEnemies.push(shooter)
  })
  
  const aliveTowers = updatedTowers.filter(t => t.health > 0)
  const aliveAllies = updatedAllies.filter(a => a.health > 0)
  
  return {
    enemies: updatedEnemies,
    towers: aliveTowers,
    allies: aliveAllies,
    newShots,
    hitTowerIds
  }
}

export const processAllyAttacks = (allies, enemies, now) => {
  const updatedAllies = []
  const updatedEnemies = enemies.map(e => ({ ...e }))
  const newShots = []
  const killedEnemies = []
  
  allies.forEach(ally => {
    let allyCopy = { ...ally }
    
    if (now - (allyCopy.lastAttackTime || 0) >= (allyCopy.attackCooldown || 800)) {
      const target = findClosestInRange(allyCopy, updatedEnemies, allyCopy.attackRange || 80)
      
      if (target) {
        target.health -= allyCopy.attackDamage || 20
        allyCopy.lastAttackTime = now
        allyCopy.isAttacking = true
        
        newShots.push(createShot(allyCopy, target, 'ally'))
        
        if (target.health <= 0) {
          killedEnemies.push(target)
        }
      } else {
        allyCopy.isAttacking = false
      }
    }
    
    updatedAllies.push(allyCopy)
  })
  
  const finalEnemies = updatedEnemies.filter(e => e.health > 0)
  
  return {
    allies: updatedAllies,
    enemies: finalEnemies,
    newShots,
    killedEnemies
  }
}

export const processKilledEnemies = (enemies, killedEnemies) => {
  const rewards = killedEnemies.reduce((sum, e) => sum + (e.reward || 50), 0)
  
  return {
    enemies: enemies.filter(e => e.health > 0),
    rewards,
    killCount: killedEnemies.length
  }
}
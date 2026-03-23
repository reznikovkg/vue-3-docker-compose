const isReady = (now, lastTime, cooldown) => {
  return now - (lastTime || 0) >= cooldown
}

const applyDamage = (target, damage) => {
  target.health -= damage
  return target.health <= 0
}

export const findClosestInRange = (source, targets, range) => {
  return targets.reduce((closest, target) => {
    if (!target || target.health <= 0) {
      return closest
    }

    const dx = target.x - source.x
    const dy = target.y - source.y
    const distance = Math.hypot(dx, dy)

    if (distance > range) {
      return closest
    }

    if (!closest || distance < closest.distance) {
      return { target, distance }
    }

    return closest
  }, null)?.target || null
}

export const createShot = (source, target, type) => ({
  id: Date.now() + Math.random(),
  x1: source.x,
  y1: source.y,
  length: Math.hypot(target.x - source.x, target.y - source.y),
  angle: Math.atan2(target.y - source.y, target.x - source.x),
  type
})

export const processTowerAttacks = (towers, enemies) => {
  const updatedEnemies = enemies.map(e => ({ ...e }))
  const newShots = []
  const killedEnemies = []

  const updatedTowers = towers.map(tower => {
    let cooldown = Math.max(0, (tower.cooldown || 0) - 100)
    let kills = tower.kills || 0

    if (cooldown > 0) {
      return { ...tower, cooldown, kills }
    }

    const target = updatedEnemies.find(e =>
      e.health > 0 && Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.radius
    )

    if (!target) {
      return { ...tower, cooldown, kills }
    }

    const killed = applyDamage(target, tower.damage)

    cooldown = 1000 / tower.attackSpeed
    newShots.push(createShot(tower, target, 'tower'))

    if (killed) {
      kills++
      killedEnemies.push(target)
    }

    return { ...tower, cooldown, kills }
  })

  return {
    towers: updatedTowers,
    enemies: updatedEnemies.filter(e => e.health > 0),
    newShots,
    killedEnemies
  }
}

export const processShooterAttacks = (enemies, towers, allies, now) => {
  const updatedTowers = [...towers]
  const updatedAllies = [...allies]
  const newShots = []
  const hitTowerIds = []

  const updatedEnemies = enemies.map(enemy => {
    if (enemy.type !== 'shooter') {
      return enemy
    }

    const shooter = {
      ...enemy,
      shootCooldown: enemy.shootCooldown || 1000,
      lastShotTime: enemy.lastShotTime || 0,
      shootDamage: enemy.shootDamage || 15,
      shootRange: enemy.shootRange || 90,
      isShooting: false
    }

    if (!isReady(now, shooter.lastShotTime, shooter.shootCooldown)) {
      return shooter
    }

    const target = findClosestInRange(
      shooter,
      [...updatedTowers, ...updatedAllies],
      shooter.shootRange
    )

    if (!target) {
      return shooter
    }

    applyDamage(target, shooter.shootDamage)

    shooter.lastShotTime = now
    shooter.isShooting = true

    newShots.push(createShot(shooter, target, 'shooter'))

    if (target.positionId) {
      hitTowerIds.push(target.positionId)
    }

    return shooter
  })

  return {
    enemies: updatedEnemies,
    towers: updatedTowers.filter(t => t.health > 0),
    allies: updatedAllies.filter(a => a.health > 0),
    newShots,
    hitTowerIds
  }
}

export const processAllyAttacks = (allies, enemies, now) => {
  const updatedEnemies = enemies.map(e => ({ ...e }))
  const newShots = []
  const killedEnemies = []

  const updatedAllies = allies.map(ally => {
    const allyCopy = { ...ally }

    if (!isReady(now, allyCopy.lastAttackTime, allyCopy.attackCooldown || 800)) {
      return allyCopy
    }

    const target = findClosestInRange(
      allyCopy,
      updatedEnemies,
      allyCopy.attackRange || 80
    )

    if (!target) {
      allyCopy.isAttacking = false
      return allyCopy
    }

    const killed = applyDamage(target, allyCopy.attackDamage || 20)

    allyCopy.lastAttackTime = now
    allyCopy.isAttacking = true

    newShots.push(createShot(allyCopy, target, 'ally'))

    if (killed) {
      killedEnemies.push(target)
    }

    return allyCopy
  })

  return {
    allies: updatedAllies,
    enemies: updatedEnemies.filter(e => e.health > 0),
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
import { MUTATIONS } from '@/store/game/constants'

export const findClosestInRange = (source, targets, range) => {
  const inRange = targets.filter(target => {
    if (!target) 
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

export const createShot = (source, target, variant, commit, lifetime) => {
  const shotId = Date.now() + Math.random()
  
  commit(MUTATIONS.ADD_SHOT, {
    id: shotId,
    x1: source.x,
    y1: source.y,
    length: Math.hypot(target.x - source.x, target.y - source.y),
    angle: Math.atan2(target.y - source.y, target.x - source.x),
    type: variant
  })
  
  setTimeout(() => commit(MUTATIONS.REMOVE_SHOT, shotId), lifetime)
}

export const processKilledEnemies = (state, commit) => {
  const killed = state.enemies.filter(e => e.health <= 0)
  
  killed.forEach(enemy => {
    commit(MUTATIONS.ADD_POINTS, enemy.reward || 50)
    commit(MUTATIONS.INCREMENT_KILLS)
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, state.enemies.filter(e => e.health > 0))
}

export const updateTowers = (state, commit) => {
  const updatedEnemies = state.enemies.map(e => ({ ...e }))
  
  state.towers.forEach(tower => {
    const t = { ...tower }
    
    t.cooldown = Math.max(0, (t.cooldown || 0) - 100)
    
    if (t.cooldown > 0) {
      commit(MUTATIONS.UPDATE_TOWER, {
        positionId: t.positionId,
        updates: { cooldown: t.cooldown }
      })
      return
    }
    
    const target = updatedEnemies.find(e => 
      Math.hypot(e.x - t.x, e.y - t.y) <= t.radius && e.health > 0
    )
    
    if (!target) {
      commit(MUTATIONS.UPDATE_TOWER, {
        positionId: t.positionId,
        updates: { cooldown: t.cooldown }
      })
      return
    }
    
    target.health -= t.damage
    t.cooldown = 1000 / t.attackSpeed
    
    createShot(t, target, 'tower', commit, 80)
    
    if (target.health <= 0) {
      t.kills = (t.kills || 0) + 1
    }
    
    commit(MUTATIONS.UPDATE_TOWER, {
      positionId: t.positionId,
      updates: {
        cooldown: t.cooldown,
        kills: t.kills
      }
    })
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, updatedEnemies)
  
  const killed = updatedEnemies.filter(e => e.health <= 0)
  killed.forEach(enemy => {
    commit(MUTATIONS.ADD_POINTS, enemy.reward || 50)
    commit(MUTATIONS.INCREMENT_KILLS)
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, updatedEnemies.filter(e => e.health > 0))
}

export const updateShooters = (state, commit) => {
  const now = Date.now()
  
  state.enemies.filter(e => e.type === 'shooter').forEach(s => {
    s.shootCooldown = s.shootCooldown || 1000
    s.lastShotTime = s.lastShotTime || 0
    s.shootDamage = s.shootDamage || 15
    s.shootRange = s.shootRange || 90
    
    if (now - s.lastShotTime < s.shootCooldown) 
        return
    
    const target = findClosestInRange(s, [...state.towers, ...state.allies], s.shootRange)
    if (!target) 
        return
    
    target.health -= s.shootDamage
    s.lastShotTime = now
    s.isShooting = true
    
    setTimeout(() => s.isShooting = false, 200)
    
    if (target.positionId) {
      commit(MUTATIONS.SET_TOWER_HIT, {
        positionId: target.positionId,
        isHit: true
      })
      
      setTimeout(() => {
        commit(MUTATIONS.SET_TOWER_HIT, {
          positionId: target.positionId,
          isHit: false
        })
      }, 200)
    }
    
    createShot(s, target, 'shooter', commit, 150)
  })
  
  state.towers.filter(t => t.health <= 0).forEach(t => {
    commit(MUTATIONS.REMOVE_TOWER, t.positionId)
  })
  
  commit(MUTATIONS.UPDATE_ALLIES, state.allies.filter(a => a.health > 0))
}

export const updateAllies = (state, commit) => {
  const now = Date.now()
  
  const updated = state.allies
    .filter(a => a.health > 0)
    .map(a => {
      if (now - (a.lastAttackTime || 0) < (a.attackCooldown || 800)) 
        return a
      
      const target = findClosestInRange(a, state.enemies, a.attackRange || 80)
      if (!target) 
        return a
      
      target.health -= a.attackDamage || 20
      a.lastAttackTime = now
      a.isAttacking = true
      
      setTimeout(() => a.isAttacking = false, 200)
      createShot(a, target, 'ally', commit, 150)
      
      return a
    })
  
  commit(MUTATIONS.UPDATE_ALLIES, updated)
  processKilledEnemies(state, commit)
}
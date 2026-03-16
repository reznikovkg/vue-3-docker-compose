import { MUTATIONS } from '@/store/game/constants'

export const updateArtilleryStrikes = (state, commit, deltaTime) => {
  const active = state.artilleryStrikes
    .map(s => {
      s.elapsed += deltaTime
      return s
    })
    .filter(s => s.elapsed < s.duration)
  
  commit(MUTATIONS.UPDATE_ARTILLERY_STRIKES, active)
  
  const damaging = state.artilleryStrikes.filter(s => s.elapsed < 100)
  if (!damaging.length) 
    return
  
  const updated = state.enemies.map(enemy => {
    const newEnemy = { ...enemy }
    
    damaging.forEach(strike => {
      const d = Math.hypot(newEnemy.x - strike.x, newEnemy.y - strike.y)
      
      if (d <= strike.maxRadius) {
        newEnemy.health -= Math.floor(strike.maxDamage * (1 - d / strike.maxRadius))
      }
    })
    
    return newEnemy
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, updated)
}
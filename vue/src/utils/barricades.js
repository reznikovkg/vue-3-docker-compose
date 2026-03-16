import { MUTATIONS } from '@/store/game/constants'

export const updateBarricades = (state, commit, deltaTime) => {
  const toRemove = []
  
  state.barricades.forEach((b, i) => {
    const touching = state.enemies.filter(e => Math.hypot(e.x - b.x, e.y - b.y) < 30)
    
    if (touching.length) {
      b.health -= touching.length * (deltaTime / 100) * 10
    }
    
    if (b.health <= 0) 
        toRemove.push(i)
  })
  
  if (toRemove.length) {
    commit(
      MUTATIONS.UPDATE_BARRICADES,
      state.barricades.filter((_, i) => !toRemove.includes(i))
    )
  }
  
  const updated = state.enemies.map(e => {
    e.isBlockedByBarricade = state.barricades.some(b => Math.hypot(e.x - b.x, e.y - b.y) < 30)
    return e
  })
  
  commit(MUTATIONS.UPDATE_ENEMIES, updated)
}
export const processBarricades = (barricades, enemies, deltaTime) => {
  const updatedBarricades = []
  const toRemove = []
  
  barricades.forEach((barricade, index) => {
    let health = barricade.health
    
    const touching = enemies.filter(e => Math.hypot(e.x - barricade.x, e.y - barricade.y) < 30)
    
    if (touching.length) {
      health -= touching.length * (deltaTime / 100) * 10
    }
    
    if (health <= 0) {
      toRemove.push(index)
    } else {
      updatedBarricades.push({
        ...barricade,
        health
      })
    }
  })
  
  const updatedEnemies = enemies.map(enemy => ({
    ...enemy,
    isBlockedByBarricade: barricades.some(b => Math.hypot(enemy.x - b.x, enemy.y - b.y) < 30)
  }))
  
  return {
    barricades: updatedBarricades,
    enemies: updatedEnemies,
  }
}
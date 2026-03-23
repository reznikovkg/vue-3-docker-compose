export const processArtilleryStrikes = (strikes, enemies, deltaTime) => {
  const updatedStrikes = strikes
    .map(strike => ({
      ...strike,
      elapsed: strike.elapsed + deltaTime
    }))
    .filter(strike => strike.elapsed < strike.duration)
  
  const damagingStrikes = updatedStrikes.filter(s => s.elapsed < 100)
  
  if (damagingStrikes.length === 0) {
    return { strikes: updatedStrikes, enemies, killedEnemies: [] }
  }
  
  const killedEnemies = []
  const updatedEnemies = enemies.map(enemy => {
    let health = enemy.health
    
    damagingStrikes.forEach(strike => {
      const distance = Math.hypot(enemy.x - strike.x, enemy.y - strike.y)
      
      if (distance <= strike.maxRadius) {
        const damage = Math.floor(strike.maxDamage * (1 - distance / strike.maxRadius))
        health -= damage
      }
    })
    
    const updatedEnemy = { ...enemy, health }
    
    if (health <= 0 && enemy.health > 0) {
      killedEnemies.push(updatedEnemy)
    }
    
    return updatedEnemy
  }).filter(e => e.health > 0)
  
  return {
    strikes: updatedStrikes,
    enemies: updatedEnemies,
    killedEnemies
  }
}
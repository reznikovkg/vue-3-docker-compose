export const processBarricades = (barricades, enemies, deltaTime) => {
  const updatedBarricades = []

  const updatedEnemies = enemies.map(enemy => {
    const isBlocked = barricades.some(b => {
      const dx = enemy.x - b.x
      const dy = enemy.y - b.y
      return Math.hypot(dx, dy) < 30
    })

    return {
      ...enemy,
      isBlockedByBarricade: isBlocked
    }
  })

  barricades.forEach(barricade => {
    let health = barricade.health

    const touchingCount = enemies.reduce((count, e) => {
      const dx = e.x - barricade.x
      const dy = e.y - barricade.y

      return Math.hypot(dx, dy) < 30 ? count + 1 : count
    }, 0)

    if (touchingCount > 0) {
      health -= touchingCount * (deltaTime / 100) * 10
    }

    if (health > 0) {
      updatedBarricades.push({
        ...barricade,
        health
      })
    }
  })

  return {
    barricades: updatedBarricades,
    enemies: updatedEnemies
  }
}
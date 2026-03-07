export const updateTowers = (ctx) => {
  const killedEnemies = ctx.enemies.filter(e => e.health <= 0)

  ctx.enemies = ctx.enemies.filter(e => e.health > 0)

  killedEnemies.forEach(enemy => {
    ctx.rewardForKill?.(enemy)
  })

  ctx.towers.forEach(t => {
    t.cooldown = Math.max(0, (t.cooldown || 0) - 100)
    if (t.cooldown > 0) 
      return

    let target = ctx.enemies.find(
      e => e.id === t.targetId && Math.hypot(e.x - t.x, e.y - t.y) <= t.radius
    )
    if (!target) {
      target = ctx.enemies.find(e => Math.hypot(e.x - t.x, e.y - t.y) <= t.radius)
      t.targetId = target?.id || null
    }
    if (!target) 
      return

    target.health -= t.damage
    t.cooldown = 1000 / t.attackSpeed

    const dx = target.x - t.x
    const dy = target.y - t.y
    const shotId = Date.now() + Math.random()
    ctx.shots.push({
      id: shotId,
      x1: t.x,
      y1: t.y,
      length: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx)
    })

    setTimeout(() => {
      const idx = ctx.shots.findIndex(s => s.id === shotId)
      if (idx !== -1) ctx.shots.splice(idx, 1)
    }, 80)

    if (target.health <= 0) {
      t.targetId = null
      t.kills = (t.kills || 0) + 1
    }
  })
}
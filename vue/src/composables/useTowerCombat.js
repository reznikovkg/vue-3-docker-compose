export const useTowerCombat = (towers, enemies, shots, selectedEnemyIndex, totalKills) => {
  const updateTowers = () => {
    if (selectedEnemyIndex.value !== null) {
      const selectedEnemy = enemies.value[selectedEnemyIndex.value]
      if (!selectedEnemy || selectedEnemy.health <= 0) {
        selectedEnemyIndex.value = null
      }
    }

    towers.value.forEach(tower => {
      if (tower.cooldown > 0) {
        tower.cooldown -= 100
        return
      }

      let target = null

      if (tower.targetId) {
        const possible = enemies.value.find(e => e.id === tower.targetId)
        if (possible && possible.health > 0) {
          const dist = Math.hypot(possible.x - tower.x, possible.y - tower.y)
          if (dist <= tower.radius) target = possible
        }
      }

      if (!target) {
        target = enemies.value.find(e => Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.radius)
        tower.targetId = target?.id || null
      }

      if (!target) return

      target.health -= tower.damage
      tower.cooldown = 1000 / tower.attackSpeed

      const dx = target.x - tower.x
      const dy = target.y - tower.y

      const id = Date.now() + Math.random()

      shots.value.push({
        id,
        x1: tower.x,
        y1: tower.y,
        length: Math.hypot(dx, dy),
        angle: Math.atan2(dy, dx)
      })

      setTimeout(() => {
        const idx = shots.value.findIndex(s => s.id === id)
        if (idx !== -1) shots.value.splice(idx, 1)
      }, 80)

      if (target.health <= 0) {
        const idx = enemies.value.findIndex(e => e.id === target.id)
        if (idx !== -1) {
          const wasSelected = selectedEnemyIndex.value === idx
          enemies.value.splice(idx, 1)
          totalKills.value++

          if (wasSelected) selectedEnemyIndex.value = null
          else if (selectedEnemyIndex.value !== null && idx < selectedEnemyIndex.value) {
            selectedEnemyIndex.value--
          }
        }

        tower.targetId = null
        tower.kills = (tower.kills || 0) + 1
      }
    })
  }

  return { updateTowers }
}
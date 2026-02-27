import { ref, computed } from 'vue'
import { LEVELS_DATA } from '@/constants/levels'

export const useGameState = () => {
  const levels = LEVELS_DATA
  const currentLevelId = ref(1)
  const currentPath = ref([])
  const towerPositions = ref([])
  const towers = ref([])
  const enemies = ref([])
  const totalKills = ref(0)
  const selectedEnemyIndex = ref(null)
  const selectedTowerId = ref(null)

  const selectedTower = computed(() =>
    selectedTowerId.value
      ? towers.value.find(t => t.positionId === selectedTowerId.value)
      : null
  )

  const selectedEnemy = computed(() =>
    selectedEnemyIndex.value !== null ? enemies.value[selectedEnemyIndex.value] : null
  )

  const getTowerAtPosition = (positionId) =>
    towers.value.find(t => t.positionId === positionId)

  const loadLevel = (levelId) => {
    const level = levels.find(l => l.id === levelId)
    if (!level) return

    currentLevelId.value = levelId
    currentPath.value = level.path
    towerPositions.value = level.towerPositions || []
    towers.value = []
    enemies.value = level.startEnemies.map((pos, i) => ({
      id: Date.now() + Math.random() + i,
      x: pos.x,
      y: pos.y,
      health: 100,
      maxHealth: 100
    }))

    selectedEnemyIndex.value = null
    selectedTowerId.value = null
    totalKills.value = 0
  }

  const buildTower = (positionId) => {
    const position = towerPositions.value.find(p => p.id === positionId)
    if (!position) return

    const newTower = {
      positionId: position.id,
      x: position.x,
      y: position.y,
      level: 1,
      damage: 6,
      radius: 80,
      attackSpeed: 2,
      health: 100,
      maxHealth: 100,
      kills: 0,
      cooldown: 0,
      targetId: null
    }

    towers.value.push(newTower)
    selectedTowerId.value = positionId
    selectedEnemyIndex.value = null
  }

  const upgradeTower = () => {
    if (!selectedTower.value) return
    if (selectedTower.value.level >= 5) return

    selectedTower.value.level++
    selectedTower.value.damage = 6 + selectedTower.value.level * 2.5
    selectedTower.value.attackSpeed = 2 + selectedTower.value.level * 0.7
    selectedTower.value.radius = 80 + selectedTower.value.level * 8
    selectedTower.value.maxHealth += 20
    selectedTower.value.health = selectedTower.value.maxHealth
  }

  const getNextEnemyPosition = (enemy, direction) => {
    const speed = 10
    let x = enemy.x
    let y = enemy.y

    if (direction === 'up') y -= speed
    if (direction === 'down') y += speed
    if (direction === 'left') x -= speed
    if (direction === 'right') x += speed

    return { x, y }
  }

  const moveEnemy = (direction, isPointOnPath) => {
    if (!selectedEnemy.value) return

    const { x, y } = getNextEnemyPosition(selectedEnemy.value, direction)

    if (!isPointOnPath(x, y, currentPath.value)) return

    selectedEnemy.value.x = x
    selectedEnemy.value.y = y
  }

  return {
    levels,
    currentLevelId,
    currentPath,
    towerPositions,
    towers,
    enemies,
    totalKills,
    selectedEnemyIndex,
    selectedTowerId,
    selectedTower,
    selectedEnemy,
    getTowerAtPosition,
    loadLevel,
    buildTower,
    upgradeTower,
    moveEnemy,
    getNextEnemyPosition
  }
}
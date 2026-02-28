import { LEVELS_DATA } from '@/constants/levels'
import { isPointOnPath } from '@/composables/usePathUtils'

export const createGameState = () => ({
  levels: LEVELS_DATA,
  currentLevelId: 1,
  currentPath: [],
  towerPositions: [],
  towers: [],
  enemies: [],
  totalKills: 0,
  selectedEnemyId: null,
  selectedTowerId: null
})

export const gameStateMethods = {

  getTowerAtPosition(positionId) {
    return this.towers.find(t => t.positionId === positionId) || null
  },

  loadLevel(levelId) {
    const level = this.levels.find(l => l.id === levelId)
    if (!level) 
      return

    this.currentLevelId = levelId
    this.currentPath = level.path || []
    this.towerPositions = level.towerPositions || []
    this.towers = []
    this.enemies = (level.startEnemies || []).map((pos, i) => ({
      id: Date.now() + Math.random() + i,
      x: pos.x,
      y: pos.y,
      health: 100,
      maxHealth: 100
    }))

    this.selectedEnemyId = null
    this.selectedTowerId = null
    this.totalKills = 0
  },

  buildTower(positionId) {
    const position = this.towerPositions.find(p => p.id === positionId)
    if (!position) 
      return

    this.towers.push({
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
    })

    this.selectedTowerId = positionId
    this.selectedEnemyId = null
  },

  upgradeTower() {
    if (!this.selectedTower) 
      return
    if (this.selectedTower.level >= 5) 
      return

    const t = this.selectedTower
    t.level++
    t.damage = 6 + t.level * 2.5
    t.attackSpeed = 2 + t.level * 0.7
    t.radius = 80 + t.level * 8
    t.maxHealth += 20
    t.health = t.maxHealth
  },

  getNextEnemyPosition(enemy, direction) {
    const speed = 10
    let { x, y } = enemy

    if (direction === 'up') 
      y -= speed
    if (direction === 'down') 
      y += speed
    if (direction === 'left') 
      x -= speed
    if (direction === 'right') 
      x += speed

    return { x, y }
  },

  getSelectedEnemy() {
    if (this.selectedEnemyId === null) 
      return null
    return this.enemies.find(e => e.id === this.selectedEnemyId) || null
  },

  moveEnemy(direction) {
    if (!this.canMoveEnemy(direction)) 
      return false

    const enemy = this.getSelectedEnemy()
    const { x, y } = this.getNextEnemyPosition(enemy, direction)

    enemy.x = x
    enemy.y = y
    return true
  },

  canMoveEnemy(direction) {
    const enemy = this.getSelectedEnemy()
    if (!enemy) 
      return false

    const { x, y } = this.getNextEnemyPosition(enemy, direction)
    return isPointOnPath(x, y, this.currentPath)
  }
}
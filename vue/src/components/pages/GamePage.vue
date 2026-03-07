<template>
  <div class="game">
    <div
      v-if="gameOver"
      class="game__overlay"
    >
      <div class="game__game-over">
        <div class="game__game-over-title">
          Игра окончена!
        </div>
        <div class="game__game-over-message">
          Враг достиг цели
        </div>
        <button
          class="game__restart-button"
          @click="() => restartLevel()"
        >
          Начать заново
        </button>
      </div>
    </div>

    <div
      v-if="victory"
      class="game__overlay"
    >
      <div class="game__victory">
        <div class="game__victory-title">
          Победа!
        </div>
        <div class="game__victory-message">
          Все враги уничтожены
        </div>
        <button
          v-if="currentLevelId < levels.length"
          class="game__next-level-button"
          @click="() => goToNextLevel()"
        >
          Следующий уровень
        </button>
        <button
          class="game__restart-button"
          @click="() => restartLevel()"
        >
          Начать заново
        </button>
      </div>
    </div>

    <div class="game__header">
      <LevelButtons
        :levels="levels"
        :current-id="currentLevelId"
        class="game__level-buttons"
        @select="(id) => loadLevel(id)"
      />

      <div class="game__economy">
        <div class="game__points">
          Очки: {{ points }}
        </div>
        <div class="game__kills">
          Убито: {{ totalKills }} / {{ maxEnemies }}
        </div>
      </div>
    </div>

    <div class="game__layout">
      <div
        ref="gameArea"
        class="game__area"
        @click="(e) => handleClick(e)"
        @contextmenu.prevent="(e) => handleRightClick(e)"
      >
        <Path
          class="game__path"
          :path-points="pathPoints"
        />

        <Tower
          v-for="position in towerPositions"
          :key="position.id"
          :x="position.x"
          :y="position.y"
          :level="getTowerAtPosition(position.id)?.level || 1"
          :radius="getTowerAtPosition(position.id)?.radius || 80"
          :selected="selectedTowerId === position.id"
          :has-tower="!!getTowerAtPosition(position.id)"
          class="game__tower"
          @click="() => selectTowerPosition(position.id)"
        />

        <Shot
          v-for="shot in shots"
          :key="shot.id"
          :x1="shot.x1"
          :y1="shot.y1"
          :length="shot.length"
          :angle="shot.angle"
          class="game__shot"
        />

        <Enemy
          v-for="enemy in enemies"
          :key="enemy.id"
          :x="enemy.x"
          :y="enemy.y"
          :health="enemy.health"
          :max-health="enemy.maxHealth"
          :color="enemy.color"
          class="game__enemy"
        />
      </div>

      <InfoPanel
        :selected-tower="selectedTower"
        :points="points"
        :tower-cost="TOWER_COST"
        :upgrade-cost="getUpgradeCost"
        class="game__info-panel"
        @upgrade-tower="() => upgradeTower()"
      />
    </div>
  </div>
</template>

<script>
import LevelButtons from '@/components/ui/LevelButtons.vue'
import InfoPanel from '@/components/ui/InfoPanel.vue'
import Path from '@/components/game/Path.vue'
import Tower from '@/components/game/Tower.vue'
import Enemy from '@/components/game/Enemy.vue'
import Shot from '@/components/game/Shot.vue'

import { createGameState } from '@/composables/useGameState'
import { createGameLoop } from '@/composables/useGameLoop'
import { calculatePathPoints } from '@/composables/usePathUtils'

const UPGRADE_COST = [150, 250, 400, 600]

export default {
  name: 'Game',
  components: {
    LevelButtons,
    InfoPanel,
    Path,
    Tower,
    Enemy,
    Shot
  },
  data() {
    return {
      ...createGameState()
    }
  },
  computed: {
    selectedTower() {
      if (!this.selectedTowerId) {
        return null
      }

      return this.towers.find(t => t.positionId === this.selectedTowerId) || null
    },
    pathPoints() {
      return calculatePathPoints(this.currentPath)
    },
    currentLevel() {
      return this.levels.find(l => l.id === this.currentLevelId)
    },
    getUpgradeCost() {
      if (!this.selectedTower) {
        return 0
      }
      const level = this.selectedTower.level
      if (level >= 5) {
        return 0
      }
      return UPGRADE_COST[level - 1] || 0
    }
  },
  mounted() {
    this.loadLevel(1)
    this.gameLoop = createGameLoop(this)
    this.gameLoop.startLoop()
  },
  beforeUnmount() {
    if (this.gameLoop) {
      this.gameLoop.stopLoop()
    }
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval)
    }
  },
  methods: {
    getTowerAtPosition(positionId) {
      return this.towers.find(t => t.positionId === positionId) || null
    },

    getRandomEnemyType() {
      const level = this.currentLevel
      if (!level?.enemyTypes?.length) {
        return {
          type: 'medium',
          health: 100,
          reward: 50,
          speed: 0.08,
          color: '#FF9800'
        }
      }

      const rand = Math.random()
      let cumulative = 0

      const selectedType = level.enemyTypes.find(enemyType => {
        cumulative += enemyType.chance
        return rand < cumulative
      })

      if (selectedType) {
        return {
          type: selectedType.type,
          health: selectedType.health,
          reward: selectedType.reward,
          speed: selectedType.speed,
          color: selectedType.color
        }
      }

      const first = level.enemyTypes[0]
      return {
        type: first.type,
        health: first.health,
        reward: first.reward,
        speed: first.speed,
        color: first.color
      }
    },

    goToNextLevel() {
      const nextLevelId = this.currentLevelId + 1
      if (nextLevelId <= this.levels.length) {
        this.loadLevel(nextLevelId)
      }
    },

    checkVictory() {
      if (this.enemies.length === 0 && this.enemiesSpawned >= this.maxEnemies && !this.gameOver) {
        this.victory = true
        if (this.spawnInterval) {
          clearInterval(this.spawnInterval)
          this.spawnInterval = null
        }
      }
    },

    initLevel(level) {
      this.currentPath = level.path.map(p => ({ ...p }))
      this.towerPositions = level.towerPositions ? level.towerPositions.map(p => ({ ...p, id: p.id })) : []
      this.towers = []
      this.enemies = []
      this.enemiesSpawned = 0
      this.selectedTowerId = null
      this.totalKills = 0
      this.points = level.startCapital || 200
      this.shots = []
      this.maxEnemies = level.maxEnemies || 15

      this.spawnEnemies(level)
    },

    spawnEnemies(level) {
      const spawnRate = level.spawnRate || 2000
      const startPoint = { ...level.path[0] }

      const spawnOne = () => {
        const config = this.getRandomEnemyType()

        const enemyPath = level.path.map(p => ({
          x: p.x,
          y: p.y
        }))

        this.enemies.push({
          id: Date.now() + Math.random(),
          x: startPoint.x,
          y: startPoint.y,
          health: config.health,
          maxHealth: config.health,
          type: config.type,
          color: config.color,
          reward: config.reward,
          path: enemyPath,
          currentTargetIndex: 1,
          currentTarget: enemyPath[1] ? { ...enemyPath[1] } : { ...enemyPath[0] },
          speed: config.speed
        })

        this.enemiesSpawned++
      }

      spawnOne()

      this.spawnInterval = setInterval(() => {
        if (this.enemiesSpawned < this.maxEnemies && !this.gameOver && !this.victory) {
          spawnOne()
        } else {
          clearInterval(this.spawnInterval)
          this.spawnInterval = null
        }
      }, spawnRate)
    },

    loadLevel(levelId) {
      const level = this.levels.find(l => l.id === levelId)
      if (!level) {
        return
      }

      if (this.spawnInterval) {
        clearInterval(this.spawnInterval)
        this.spawnInterval = null
      }

      this.gameOver = false
      this.victory = false
      this.currentLevelId = levelId
      this.enemies = []
      this.towers = []
      this.shots = []
      this.selectedTowerId = null
      this.initLevel(level)
    },

    restartLevel() {
      const level = this.levels.find(l => l.id === this.currentLevelId)
      if (!level) {
        return
      }

      this.gameOver = false
      this.victory = false

      this.initLevel(level)
    },
    buildTower(positionId) {
      if (this.gameOver || this.victory) {
        return
      }

      const pos = this.towerPositions.find(p => p.id === positionId)
      if (!pos) {
        return
      }

      if (this.points < this.TOWER_COST) {
        this.showInsufficientFunds = true
        setTimeout(() => {
          this.showInsufficientFunds = false
        }, 2000)
        return
      }

      this.points -= this.TOWER_COST

      this.towers.push({
        positionId: pos.id,
        x: pos.x,
        y: pos.y,
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

      this.selectedTowerId = null
    },
    upgradeTower() {
      if (!this.selectedTower || this.selectedTower.level >= 5 || this.gameOver || this.victory) {
        return
      }

      const cost = this.getUpgradeCost
      if (this.points < cost) {
        this.showInsufficientFunds = true
        setTimeout(() => {
          this.showInsufficientFunds = false
        }, 2000)
        return
      }

      this.points -= cost

      const t = this.selectedTower
      t.level++
      t.damage = 6 + t.level * 2.5
      t.attackSpeed = 2 + t.level * 0.7
      t.radius = 80 + t.level * 8
      t.maxHealth += 20
      t.health = t.maxHealth
      this.selectedTowerId = null
    },
    selectTowerPosition(positionId) {
      if (this.gameOver || this.victory) {
        return
      }

      const existingTower = this.getTowerAtPosition(positionId)
      if (!existingTower) {
        this.buildTower(positionId)
      } else {
        this.selectedTowerId = positionId
      }
    },
    handleClick(event) {
      if (this.gameOver || this.victory) {
        return
      }

      const rect = this.$refs.gameArea.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      const clickedPosition = this.towerPositions.find(
        pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
      )

      if (clickedPosition) {
        this.selectTowerPosition(clickedPosition.id)
      }
    },

    handleRightClick(event) {
      if (this.gameOver || this.victory) {
        return
      }

      const rect = this.$refs.gameArea.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      const clickedPosition = this.towerPositions.find(
        pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
      )

      if (!clickedPosition) {
        return
      }

      const idx = this.towers.findIndex(t => t.positionId === clickedPosition.id)
      if (idx !== -1) {
        this.towers.splice(idx, 1)
      }

      if (this.selectedTowerId === clickedPosition.id) {
        this.selectedTowerId = null
      }
    },

    isEnemyAtEnd(enemy) {
      if (!enemy.path?.length) {
        return false
      }
      const lastPoint = enemy.path[enemy.path.length - 1]
      const distanceToEnd = Math.hypot(enemy.x - lastPoint.x, enemy.y - lastPoint.y)
      return distanceToEnd < 5
    },

    gameOverByEnemyAtEnd() {
      this.gameOver = true
      if (this.spawnInterval) {
        clearInterval(this.spawnInterval)
        this.spawnInterval = null
      }
      this.enemies = []
      this.shots = []
    },
    checkEnemiesAtEnd() {
      if (this.enemies.some(enemy => this.isEnemyAtEnd(enemy))) {
        this.gameOverByEnemyAtEnd()
      }
    },
    rewardForKill(enemy) {
      this.points += enemy.reward || 50
      this.totalKills++
      this.checkVictory()
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  padding: 20px;
  font-family: Arial, sans-serif;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__economy {
    display: flex;
    gap: 20px;
    background: #f5f5f5;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
  }

  &__points {
    color: #f57c00;
  }

  &__kills {
    color: #4caf50;
  }

  &__area {
    position: relative;
    width: 800px;
    height: 600px;
    border: 2px solid #333;
    background: #2d5a27;
    overflow: hidden;
    cursor: crosshair;
  }

  &__layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  &__level-buttons {
    margin-bottom: 0;
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  &__game-over {
    background: white;
    padding: 30px 50px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  &__game-over-title {
    margin: 0 0 10px 0;
    color: #d32f2f;
    font-size: 28px;
  }

  &__game-over-message {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #666;
  }

  &__victory {
    background: white;
    padding: 30px 50px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  &__victory-title {
    margin: 0 0 10px 0;
    color: #4caf50;
    font-size: 28px;
  }

  &__victory-message {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #666;
  }

  &__restart-button {
    padding: 12px 30px;
    font-size: 16px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin: 0 5px;

    &:hover {
      background: #45a049;
    }
  }

  &__next-level-button {
    padding: 12px 30px;
    font-size: 16px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin: 0 5px;

    &:hover {
      background: #1976d2;
    }
  }
}
</style>
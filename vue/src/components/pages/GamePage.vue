<template>
  <div class="game">
    <LevelButtons
      :levels="levels"
      :current-id="currentLevelId"
      class="game__level-buttons"
      @select="(id) => loadLevel(id)"
    />

    <div class="game__layout layout">
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
          v-for="(enemy, index) in enemies"
          :key="enemy.id"
          :x="enemy.x"
          :y="enemy.y"
          :health="enemy.health"
          :max-health="enemy.maxHealth"
          :selected="selectedEnemyId === enemy.id"
          class="game__enemy"
          @click="() => handleEnemyClick(enemy.id)"
        />
      </div>

      <InfoPanel
        :selected-enemy="selectedEnemy"
        :selected-tower="selectedTower"
        :can-move-up="canMoveEnemy('up')"
        :can-move-down="canMoveEnemy('down')"
        :can-move-left="canMoveEnemy('left')"
        :can-move-right="canMoveEnemy('right')"
        class="game__info-panel"
        @move="(dir) => moveEnemy(dir)"
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
import { calculatePathPoints, isPointOnPath } from '@/composables/usePathUtils'

export default {
  name: 'Game',
  components: { LevelButtons, InfoPanel, Path, Tower, Enemy, Shot },
  data() {
    return {
      ...createGameState(),
      shots: [],
      gameLoop: null
    }
  },
  computed: {
    selectedEnemy() {
      return this.enemies.find(e => e.id === this.selectedEnemyId) || null
    },
    selectedTower() {
      if (!this.selectedTowerId) 
        return null

      return this.towers.find(t => t.positionId === this.selectedTowerId) || null
    },
    pathPoints() {
      return calculatePathPoints(this.currentPath)
    }
  },
  mounted() {
    this.loadLevel(1)
    this.gameLoop = createGameLoop(this)
    this.gameLoop.startLoop()
  },
  beforeUnmount() {
    if (this.gameLoop) 
      this.gameLoop.stopLoop()
  },
  methods: {
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
      const pos = this.towerPositions.find(p => p.id === positionId)
      if (!pos) 
        return

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

      this.selectedTowerId = positionId
      this.selectedEnemyId = null
    },
    upgradeTower() {
      if (!this.selectedTower || this.selectedTower.level >= 5) 
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
    canMoveEnemy(direction) {
      const enemy = this.selectedEnemy
      if (!enemy) 
        return false

      const { x, y } = this.getNextEnemyPosition(enemy, direction)
      return isPointOnPath(x, y, this.currentPath)
    },
    moveEnemy(direction) {
      if (!this.canMoveEnemy(direction)) 
        return
      const enemy = this.selectedEnemy
      const { x, y } = this.getNextEnemyPosition(enemy, direction)
      enemy.x = x
      enemy.y = y
    },
    selectTowerPosition(positionId) {
      const existingTower = this.getTowerAtPosition(positionId)
      if (!existingTower) {
        this.buildTower(positionId)
      } else {
        this.selectedTowerId = positionId
        this.selectedEnemyId = null
      }
    },
    handleClick(event) {
      const rect = this.$refs.gameArea.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      const clickedPosition = this.towerPositions.find(
        pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
      )

      if (clickedPosition) 
        this.selectTowerPosition(clickedPosition.id)
    },
    handleRightClick(event) {
      const rect = this.$refs.gameArea.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      const clickedPosition = this.towerPositions.find(
        pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
      )

      if (!clickedPosition) 
        return

      const idx = this.towers.findIndex(t => t.positionId === clickedPosition.id)
      if (idx !== -1) 
        this.towers.splice(idx, 1)

      if (this.selectedTowerId === clickedPosition.id) 
        this.selectedTowerId = null
    },
    handleEnemyClick(id) {
      const enemy = this.enemies.find(e => e.id === id)
      if (enemy) {
        this.selectedEnemyId = enemy.id
        this.selectedTowerId = null
      }
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  padding: 20px;
  font-family: Arial, sans-serif;

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
}
</style>
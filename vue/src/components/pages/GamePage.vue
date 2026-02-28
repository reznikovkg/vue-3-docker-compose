<template>
  <div class="game">
    <LevelButtons
      :levels="levels"
      :current-id="currentLevelId"
      @select="(id) => loadLevel(id)"
      class="game__level-buttons"
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
          @click="() => selectTowerPosition(position.id)"
          class="game__tower"
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
          :selected="selectedEnemyIndex === index"
          @click="() => handleEnemyClick(index)"
          class="game__enemy"
        />
      </div>

      <InfoPanel
        :selected-enemy="selectedEnemy"
        :selected-tower="selectedTower"
        :can-move-up="canMoveEnemy('up')"
        :can-move-down="canMoveEnemy('down')"
        :can-move-left="canMoveEnemy('left')"
        :can-move-right="canMoveEnemy('right')"
        @move="(dir) => moveEnemyHandler(dir)"
        @upgrade-tower="() => upgradeTower()"
        class="game__info-panel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePathUtils } from '@/composables/usePathUtils'
import { useGameLoop } from '@/composables/useGameLoop'
import { useGameState } from '@/composables/useGameState'

import LevelButtons from '@/components/ui/LevelButtons.vue'
import InfoPanel from '@/components/ui/InfoPanel.vue'
import Path from '@/components/game/Path.vue'
import Tower from '@/components/game/Tower.vue'
import Enemy from '@/components/game/Enemy.vue'
import Shot from '@/components/game/Shot.vue'

const gameArea = ref(null)
const shots = ref([])

const { isPointOnPath, calculatePathPoints } = usePathUtils()
const {
  levels,
  currentLevelId,
  currentPath,
  towerPositions,
  towers,
  enemies,
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
} = useGameState()

const { startLoop } = useGameLoop(towers, enemies, shots, selectedEnemyIndex)

const pathPoints = computed(() => calculatePathPoints(currentPath.value))

const handleEnemyClick = (index) => {
  if (enemies.value[index]) {
    selectedEnemyIndex.value = index
  }
}

const selectTowerPosition = (positionId) => {
  const existingTower = getTowerAtPosition(positionId)
  if (!existingTower) buildTower(positionId)
  else {
    selectedTowerId.value = positionId
    selectedEnemyIndex.value = null
  }
}

const canMoveEnemy = (direction) => {
  if (!selectedEnemy.value) return false
  const { x, y } = getNextEnemyPosition(selectedEnemy.value, direction)
  return isPointOnPath(x, y, currentPath.value)
}

const moveEnemyHandler = (direction) => moveEnemy(direction, isPointOnPath)

const handleClick = (event) => {
  const rect = gameArea.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const clickedPosition = towerPositions.value.find(
    pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
  )
  if (clickedPosition) selectTowerPosition(clickedPosition.id)
}

const handleRightClick = (event) => {
  const rect = gameArea.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const clickedPosition = towerPositions.value.find(
    pos => Math.hypot(clickX - pos.x, clickY - pos.y) < 20
  )
  if (!clickedPosition) return

  const idx = towers.value.findIndex(t => t.positionId === clickedPosition.id)
  if (idx !== -1) towers.value.splice(idx, 1)

  if (selectedTowerId.value === clickedPosition.id) selectedTowerId.value = null
}

onMounted(() => {
  loadLevel(1)
  startLoop()
})
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
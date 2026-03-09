<template>
  <div class="towerDefensePage">
    <div class="towerDefensePage__topBar">
      <div class="towerDefensePage__levelList">
        <button
          v-for="level in levels"
          :key="level.id"
          type="button"
          class="towerDefensePage__levelButton"
          :class="{ towerDefensePage__levelButton_active: level.id === currentLevel.id }"
          @click="() => page.selectLevel(level.id)"
        >
          {{ level.name }}
        </button>
      </div>
    </div>

    <div class="towerDefensePage__layout">
      <div
        ref="boardElement"
        class="towerDefensePage__boardFrame"
        tabindex="0"
        @keydown="(event) => page.onBoardKeyDown(event)"
      >
        <svg
          ref="svgElement"
          :viewBox="viewBox"
          class="towerDefensePage__board"
          @mousemove="(event) => page.dragEnemy(event)"
          @mouseup="() => page.stopEnemyDrag()"
          @mouseleave="() => page.stopEnemyDrag()"
        >
          <polyline :points="pathPoints" class="towerDefensePage__path" />

          <circle
            v-for="tower in towers"
            :key="`range-${tower.id}`"
            :cx="tower.x"
            :cy="tower.y"
            :r="tower.attackRadius"
            class="towerDefensePage__towerRange"
          />

          <circle
            v-for="slot in currentLevel.towerSlots"
            :key="slot.id"
            :cx="slot.x"
            :cy="slot.y"
            :r="18"
            class="towerDefensePage__slot"
            :class="{
              towerDefensePage__slot_active: slot.id === selectedSlotId,
              towerDefensePage__slot_busy: Boolean(towerBySlotId[slot.id]),
            }"
            @click.stop="() => page.selectSlot(slot.id)"
          />

          <circle
            v-for="tower in towers"
            :key="tower.id"
            :cx="tower.x"
            :cy="tower.y"
            :r="12"
            class="towerDefensePage__tower"
          />

          <circle
            v-for="enemy in enemies"
            :key="enemy.id"
            :cx="enemy.x"
            :cy="enemy.y"
            :r="enemy.radius"
            class="towerDefensePage__enemy"
            :class="{ towerDefensePage__enemy_active: enemy.id === selectedEnemyId }"
            @click.stop="() => page.selectEnemy(enemy.id)"
            @mousedown.stop="(event) => page.startEnemyDrag(event, enemy.id)"
          />

          <circle
            v-for="projectile in projectiles"
            :key="projectile.id"
            :cx="projectile.x"
            :cy="projectile.y"
            :r="projectile.radius"
            class="towerDefensePage__projectile"
          />
        </svg>
      </div>

      <div class="towerDefensePage__panel">
        <div class="towerDefensePage__panelSection">
          <div class="towerDefensePage__sectionTitle">Selected Slot</div>
          <div class="towerDefensePage__text">{{ selectedSlotText }}</div>
          <div class="towerDefensePage__actions">
            <button type="button" class="towerDefensePage__actionButton" @click="() => page.addTower()">
              Add Tower
            </button>
            <button
              type="button"
              class="towerDefensePage__actionButton"
              :disabled="!selectedTower"
              @click="() => page.upgradeTower()"
            >
              Upgrade Tower
            </button>
            <button
              type="button"
              class="towerDefensePage__actionButton towerDefensePage__actionButton_danger"
              :disabled="!selectedTower"
              @click="() => page.removeTower()"
            >
              Remove Tower
            </button>
          </div>
        </div>

        <div class="towerDefensePage__panelSection">
          <div class="towerDefensePage__sectionTitle">Tower Stats</div>
          <div v-if="selectedTower" class="towerDefensePage__statsList">
            <div class="towerDefensePage__text">Level: {{ selectedTower.level }}</div>
            <div class="towerDefensePage__text">Damage: {{ selectedTower.damage }}</div>
            <div class="towerDefensePage__text">Health: {{ selectedTower.health }}</div>
            <div class="towerDefensePage__text">Rate: {{ selectedTower.rateOfFire.toFixed(1) }}</div>
            <div class="towerDefensePage__text">Radius: {{ selectedTower.attackRadius }}</div>
          </div>
          <div v-else class="towerDefensePage__text">No tower in selected slot</div>
        </div>

        <div class="towerDefensePage__panelSection">
          <div class="towerDefensePage__sectionTitle">Enemy Spawn</div>
          <div class="towerDefensePage__pointInputs">
            <label class="towerDefensePage__pointLabel">
              X
              <input v-model.number="enemySpawnX" type="number" class="towerDefensePage__pointInput">
            </label>
            <label class="towerDefensePage__pointLabel">
              Y
              <input v-model.number="enemySpawnY" type="number" class="towerDefensePage__pointInput">
            </label>
          </div>
          <button type="button" class="towerDefensePage__actionButton" @click="() => page.spawnEnemyAtCustomPoint()">
            Add Enemy At Point
          </button>
        </div>

        <div class="towerDefensePage__panelSection">
          <div class="towerDefensePage__sectionTitle">Enemy Controls</div>
          <div class="towerDefensePage__text">Enemies: {{ enemies.length }}</div>
          <div class="towerDefensePage__text">Projectiles: {{ projectiles.length }}</div>
          <div class="towerDefensePage__text">{{ selectedEnemyText }}</div>
          <div class="towerDefensePage__hint">
            Drag enemy with cursor, use arrow keys to move selected enemy
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { KEY_BINDINGS } from '@/store/towerDefense'
import TowerDefensePageClass from '@/components/pages/towerDefense/TowerDefensePageClass'

const TICK_MS = 120
const MOVE_STEP = 16

const KEY_TO_DELTA = {
  [KEY_BINDINGS.ARROW_UP]: { x: 0, y: -MOVE_STEP },
  [KEY_BINDINGS.ARROW_DOWN]: { x: 0, y: MOVE_STEP },
  [KEY_BINDINGS.ARROW_LEFT]: { x: -MOVE_STEP, y: 0 },
  [KEY_BINDINGS.ARROW_RIGHT]: { x: MOVE_STEP, y: 0 },
}

const store = useStore()

const boardElement = ref(null)
const svgElement = ref(null)
const selectedSlotId = ref(null)
const draggingEnemyId = ref(null)
const simulationIntervalId = ref(null)
const enemySpawnX = ref(0)
const enemySpawnY = ref(0)

const levels = computed(() => store.getters['towerDefense/getLevels'])
const currentLevel = computed(() => store.getters['towerDefense/getCurrentLevel'])
const towers = computed(() => store.getters['towerDefense/getTowers'])
const enemies = computed(() => store.getters['towerDefense/getEnemies'])
const projectiles = computed(() => store.getters['towerDefense/getProjectiles'])
const selectedEnemyId = computed(() => store.getters['towerDefense/getSelectedEnemyId'])

const viewBox = computed(() => `0 0 ${currentLevel.value.width} ${currentLevel.value.height}`)
const pathPoints = computed(() => currentLevel.value.path.map((point) => `${point.x},${point.y}`).join(' '))

const towerBySlotId = computed(() => {
  const map = {}
  towers.value.forEach((tower) => {
    map[tower.slotId] = tower
  })
  return map
})

const selectedSlot = computed(() => {
  const slotList = currentLevel.value.towerSlots || []
  return slotList.find((slot) => slot.id === selectedSlotId.value) || null
})

const selectedTower = computed(() => {
  if (!selectedSlotId.value) {
    return null
  }
  return towerBySlotId.value[selectedSlotId.value] || null
})

const selectedSlotText = computed(() => {
  if (!selectedSlot.value) {
    return 'No slot selected'
  }
  return `${selectedSlot.value.id}  x:${Math.round(selectedSlot.value.x)} y:${Math.round(selectedSlot.value.y)}`
})

const selectedEnemy = computed(() => {
  if (!selectedEnemyId.value) {
    return null
  }
  return enemies.value.find((enemy) => enemy.id === selectedEnemyId.value) || null
})

const selectedEnemyText = computed(() => {
  if (!selectedEnemy.value) {
    return 'No enemy selected'
  }
  return `Enemy #${selectedEnemy.value.id}  hp:${Math.round(selectedEnemy.value.health)}  x:${Math.round(selectedEnemy.value.x)} y:${Math.round(selectedEnemy.value.y)}`
})

const normalizeSpawnCoordinate = (value, fallback, max) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  return Math.min(Math.max(value, 0), max)
}

const toBoardPoint = (event) => {
  if (!svgElement.value) {
    return null
  }

  const rect = svgElement.value.getBoundingClientRect()
  if (!rect.width || !rect.height) {
    return null
  }

  return {
    x: ((event.clientX - rect.left) / rect.width) * currentLevel.value.width,
    y: ((event.clientY - rect.top) / rect.height) * currentLevel.value.height,
  }
}

const page = new TowerDefensePageClass({
  store,
  boardElement,
  currentLevel,
  draggingEnemyId,
  enemySpawnX,
  enemySpawnY,
  keyToDelta: KEY_TO_DELTA,
  normalizeSpawnCoordinate,
  selectedSlotId,
  simulationIntervalId,
  tickMs: TICK_MS,
  toBoardPoint,
})

onMounted(() => page.mount())
onBeforeUnmount(() => page.unmount())
</script>

<style scoped lang="scss">
.towerDefensePage {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.towerDefensePage__topBar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.towerDefensePage__levelList {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.towerDefensePage__levelButton,
.towerDefensePage__actionButton {
  border: 1px solid #bac7bf;
  background: #ffffff;
  color: #1d2b22;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}

.towerDefensePage__levelButton_active {
  background: #d8f0de;
  border-color: #5f9d74;
}

.towerDefensePage__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 12px;
}

.towerDefensePage__boardFrame {
  border: 1px solid #c3d0c8;
  border-radius: 8px;
  overflow: hidden;
  background: #eef5f2;
  outline: none;
}

.towerDefensePage__boardFrame:focus {
  box-shadow: 0 0 0 2px #5f9d74;
}

.towerDefensePage__board {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
}

.towerDefensePage__path {
  fill: none;
  stroke: #4f6369;
  stroke-width: 18;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.towerDefensePage__towerRange {
  fill: rgba(58, 125, 74, 0.12);
  stroke: rgba(58, 125, 74, 0.35);
  stroke-width: 1;
  pointer-events: none;
}

.towerDefensePage__slot {
  fill: #f1ebd7;
  stroke: #9a936d;
  stroke-width: 2;
  cursor: pointer;
}

.towerDefensePage__slot_busy {
  fill: #ddd4b0;
}

.towerDefensePage__slot_active {
  stroke: #2a7d45;
}

.towerDefensePage__tower {
  fill: #336f53;
  stroke: #103e28;
  stroke-width: 2;
}

.towerDefensePage__enemy {
  fill: #a33636;
  stroke: #631212;
  stroke-width: 2;
  cursor: grab;
}

.towerDefensePage__enemy_active {
  stroke: #ffe17d;
  stroke-width: 3;
}

.towerDefensePage__projectile {
  fill: #f4c841;
  stroke: #7a6018;
  stroke-width: 1;
  pointer-events: none;
}

.towerDefensePage__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.towerDefensePage__panelSection {
  border: 1px solid #c3d0c8;
  border-radius: 8px;
  padding: 10px;
  background: #f8fbf9;
}

.towerDefensePage__sectionTitle {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #000000;
}

.towerDefensePage__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.towerDefensePage__pointInputs {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.towerDefensePage__pointLabel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #30443a;
  font-size: 12px;
}

.towerDefensePage__pointInput {
  border: 1px solid #bac7bf;
  border-radius: 6px;
  padding: 4px 6px;
  width: 90px;
}

.towerDefensePage__actionButton_danger {
  border-color: #cb9999;
  color: #7f2323;
}

.towerDefensePage__statsList,
.towerDefensePage__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #26382f;
  font-size: 13px;
}

.towerDefensePage__hint {
  margin-top: 8px;
  color: #4b6257;
  font-size: 12px;
  line-height: 1.3;
}

@media (max-width: 1040px) {
  .towerDefensePage__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

<template>
  <div class="game-grid">
    <svg 
      class="game-grid__container" 
      :viewBox="viewBox" 
      :style="gridStyle"
    >
      <g v-for="row in storeGridSizeY" :key="`row-${row}`">
        <g v-for="col in storeGridSizeX" :key="`cell-${row}-${col}`">
          <polygon
            :points="getCellPoints(row - 1, col - 1)"
            class="game-grid__ground"
            :class="getCellClasses(row - 1, col - 1)"
            @click="() => handleCellClick(row - 1, col - 1)"
            @mouseover="() => handleCellHover(row - 1, col - 1)"
          />
          <polygon
            v-if="isRoad(row - 1, col - 1)"
            :points="getCellPoints(row - 1, col - 1)"
            class="game-grid__road"
          />
          <polygon
            v-if="isPreviewCell(row - 1, col - 1) && !hasShape(row - 1, col - 1)"
            :points="getCellPoints(row - 1, col - 1)"
            class="game-grid__preview"
          />
          <g v-if="hasShape(row - 1, col - 1)">
            <polygon
              :points="getCellPoints(row - 1, col - 1)"
              class="game-grid__shape"
              :style="{ fill: getShapeColor(row - 1, col - 1) }"
            />
            <g v-if="isMainCell(row - 1, col - 1)">
              <text
                v-if="getShapeLevel(row - 1, col - 1) > 1"
                :x="getCellCenterX(row - 1, col - 1)"
                :y="getCellCenterY(row - 1, col - 1)-15"
                text-anchor="middle"
                class="game-grid__shape-level"
              >
                Ур.{{ getShapeLevel(row - 1, col - 1) }}
              </text>
              <text
                v-if="getShapeCapacity(row - 1, col - 1) > 0"
                :x="getCellCenterX(row - 1, col - 1)"
                :y="getCellCenterY(row - 1, col - 1)"
                text-anchor="middle"
                class="game-grid__shape-capacity"
              >
                {{ getCurrentVisitors(row - 1, col - 1) }}/{{ getShapeCapacity(row - 1, col - 1) }}
              </text>
              <text
                v-if="getShapeIncome(row - 1, col - 1) > 0"
                :x="getCellCenterX(row - 1, col - 1)"
                :y="getCellCenterY(row - 1, col - 1) + 15"
                text-anchor="middle"
                class="game-grid__shape-income"
              >
                +{{ getShapeIncome(row - 1, col - 1) }}
              </text>
            </g>
          </g>
        </g>
      </g>
      <g v-if="storeGridSizeY > 0">
        <polygon
          :points="getEntrancePoints()"
          class="game-grid__entrance"
        />
      </g>
      <g v-for="person in people" :key="person.id">
        <g :transform="`translate(${getPersonX(person)}, ${getPersonY(person)})`">
          <circle
            v-if="person.criticalIndicators && person.criticalIndicators.length > 0"
            :cx="CELL_SIZE / 5"
            :cy="-CELL_SIZE / 5"
            r="5"
            class="game-grid__person-warning"
          >
          </circle>
          <circle
            :cx="0"
            :cy="0"
            :r="CELL_SIZE / 5"
            class="game-grid__person"
            :class="getPersonClass(person)"
            :stroke="getMoodBorderColor(person.mood)"
            stroke-width="2"
            @mouseenter="() => hoveredPerson = person"
            @mouseleave="() => hoveredPerson = null"
          />
          <text
            :x="0"
            :y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            class="game-grid__person-balance"
          >
            {{ person.balance }}
          </text>
        </g>
      </g>
      <foreignObject
        v-if="hoveredPerson"
        :x="getTooltipX()"
        :y="getTooltipY()"
        width="150"
        height="100"
        class="game-grid__tooltip-foreign"
      >
        <div class="game-grid__tooltip">
          {{ hoveredPerson.tooltipText }}
        </div>
      </foreignObject>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { moodUtils } from '../moodUtils'

const CELL_SIZE = 50
const hoveredPerson = ref<any>(null)

const store = useStore()

const grid = computed(() => store.getters.getGrid)
const selectedShape = computed(() => store.getters.getSelectedShape)
const gameMode = computed(() => store.getters.getGameMode)
const previewCells = computed(() => store.getters.getPreviewCells)
const storeGridSizeX = computed(() => store.getters.getGridSizeX)
const storeGridSizeY = computed(() => store.getters.getGridSizeY)
const roads = computed(() => store.getters.getRoads)
const isRoadMode = computed(() => store.getters.getIsRoadMode)
const people = computed(() => store.getters.getPeople)

const viewBox = computed(() => {
  return '-200 -100 600 700'
})

const getMoodBorderColor = (mood: number): string => {
  return moodUtils.getBorderColor(mood)
}

const gridStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  width: '100%',
  height: '100%',
  minHeight: '600px'
}))

const getCellCenterX = (row: number, col: number): number => {
  const offsetX = CELL_SIZE * 2
  return offsetX + (col - row) * (CELL_SIZE / 2)
}

const getCellCenterY = (row: number, col: number): number => {
  return (col + row) * (CELL_SIZE / 2)
}

const isMainCell = (row: number, col: number): boolean => {
  const cellData = grid.value[row]?.[col]
  if (!cellData || !cellData.id) {
    return false
  }
  
  const shapeId = cellData.id

  let minRow = Infinity
  let minCol = Infinity
  
  for (let r = 0; r < storeGridSizeY.value; r++) {
    for (let c = 0; c < storeGridSizeX.value; c++) {
      const cell = grid.value[r]?.[c]
      if (cell?.id === shapeId) {
        if (r < minRow) {
          minRow = r
          minCol = c
        } else if (r === minRow && c < minCol) {
          minCol = c
        }
      }
    }
  }

  return row === minRow && col === minCol
}

const getCellPoints = (row: number, col: number): string => {
  const centerX = getCellCenterX(row, col)
  const centerY = getCellCenterY(row, col)
  
  const points = [
    [centerX, centerY - CELL_SIZE / 2],
    [centerX + CELL_SIZE / 2, centerY],
    [centerX, centerY + CELL_SIZE / 2],
    [centerX - CELL_SIZE / 2, centerY]
  ]
  
  return points.map(p => p.join(',')).join(' ')
}

const getEntranceCenterX = (): number => {
  const entranceRow = Math.floor(storeGridSizeY.value / 2)
  const offsetX = CELL_SIZE * 2
  return offsetX + (-1 - entranceRow) * (CELL_SIZE / 2)
}

const getEntranceCenterY = (): number => {
  const entranceRow = Math.floor(storeGridSizeY.value / 2)
  return (-1 + entranceRow) * (CELL_SIZE / 2)
}

const getEntrancePoints = (): string => {
  const centerX = getEntranceCenterX()
  const centerY = getEntranceCenterY()
  
  const points = [
    [centerX, centerY - CELL_SIZE / 2],
    [centerX + CELL_SIZE / 2, centerY],
    [centerX, centerY + CELL_SIZE / 2],
    [centerX - CELL_SIZE / 2, centerY]
  ]
  
  return points.map(p => p.join(',')).join(' ')
}

const getPersonX = (person: any): number => {
  const offsetX = CELL_SIZE * 2
  return offsetX + (person.x - person.y) * (CELL_SIZE / 2)
}

const getPersonY = (person: any): number => {
  return (person.x + person.y) * (CELL_SIZE / 2)
}

const getTooltipX = (): number => {
  if (!hoveredPerson.value) return 0
  const offsetX = CELL_SIZE * 2
  return offsetX + (hoveredPerson.value.x - hoveredPerson.value.y) * (CELL_SIZE / 2) - 100
}

const getTooltipY = (): number => {
  if (!hoveredPerson.value) return 0
  return (hoveredPerson.value.x + hoveredPerson.value.y) * (CELL_SIZE / 2) - 140
}

const getShapeColor = (row: number, col: number): string => {
  const cellData = grid.value[row]?.[col]
  return cellData?.color || '#8B4513'
}

const getShapeLevel = (row: number, col: number): number => {
  const cellData = grid.value[row]?.[col]
  return cellData?.level || 1
}

const getShapeCapacity = (row: number, col: number): number => {
  const cellData = grid.value[row]?.[col]
  return cellData?.capacity || 0
}

const getShapeIncome = (row: number, col: number): number => {
  const cellData = grid.value[row]?.[col]
  return cellData?.income || 0
}

const getCurrentVisitors = (row: number, col: number): number => {
  const cellData = grid.value[row]?.[col]
  if (!cellData) return 0
  
  const shapeId = cellData.id
  return people.value.filter((person: any) => 
    person.targetBuilding?.id === shapeId && person.state === 'inBuilding'
  ).length
}

const getPersonClass = (person: any) => ({
  'game-grid__person--waiting': person.state === 'waiting',
  'game-grid__person--walking': person.state === 'walking',
  'game-grid__person--inBuilding': person.state === 'inBuilding'
})

const hasShape = (row: number, col: number): boolean => {
  if (row < 0 || row >= storeGridSizeY.value || col < 0 || col >= storeGridSizeX.value) {
    return false
  }
  return grid.value[row]?.[col] !== null
}

const isRoad = (row: number, col: number): boolean => {
  return roads.value.some((road: any) => road.row === row && road.col === col)
}

const getCellClasses = (row: number, col: number) => ({
  'game-grid__cell--occupied': hasShape(row, col),
  'game-grid__cell--preview': isPreviewCell(row, col),
  'game-grid__cell--road': isRoad(row, col)
})

const isPreviewCell = (row: number, col: number): boolean => {
  return previewCells.value.some((cell: any) => 
    cell.row === row && cell.col === col
  )
}

const handleCellHover = (row: number, col: number): void => {
  if (selectedShape.value && gameMode.value === 'add' && !isRoadMode.value) {
    store.dispatch('updatePreview', { row, col, gridSizeX: storeGridSizeX.value, gridSizeY: storeGridSizeY.value })
  } else {
    store.dispatch('clearPreview')
  }
}

const handleCellClick = (row: number, col: number): void => {
  if (isRoadMode.value) {
    if (isRoad(row, col)) {
      store.dispatch('removeRoad', { row, col })
    } else {
      store.dispatch('addRoad', { row, col })
    }
    return
  }
  if (gameMode.value === 'add') {
    handleAddShape(row, col)
  } else if (gameMode.value === 'remove') {
    handleRemoveShape(row, col)
  }
}

const handleAddShape = (row: number, col: number): void => {
  if (!selectedShape.value || gameMode.value !== 'add') return

  const shape = selectedShape.value
  let canAdd = true

  for (const part of shape.layout) {
    const targetRow = row + part.y
    const targetCol = col + part.x

    if (targetRow < 0 || targetRow >= storeGridSizeY.value ||
        targetCol < 0 || targetCol >= storeGridSizeX.value) {
      canAdd = false
      alert('Фигура выходит за границы поля')
      return
    }

    if (hasShape(targetRow, targetCol)) {
      canAdd = false
      alert('Нельзя разместить фигуру - место занято')
      return
    }

    if (isRoad(targetRow, targetCol)) {
      canAdd = false
      alert('Нельзя разместить фигуру на дороге')
      return
    }
  }

  if (canAdd) {
    store.dispatch('addShape', { 
      startRow: row, 
      startCol: col, 
      shape,
      gridSizeX: storeGridSizeX.value,
      gridSizeY: storeGridSizeY.value
    })
    store.dispatch('clearPreview')
  }
}

const handleRemoveShape = (row: number, col: number): void => {
  if (gameMode.value !== 'remove') return

  const cellData = grid.value[row]?.[col]
  if (!cellData) return

  store.dispatch('removeShape', {
    shapeId: cellData.id,
    gridSizeX: storeGridSizeX.value,
    gridSizeY: storeGridSizeY.value
  })
}

onMounted(() => {
  store.dispatch('initializeGrid')
})

setInterval(() => {
  store.dispatch('updatePeople')
}, 800)
</script>

<style scoped lang="less">
.game-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #f0f0f0;

  &__container {
    width: 100%;
    height: 100%;
    min-width: 700px; 
    min-height: 800px; 
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__ground {
    fill: #b9f795;
    stroke: #32CD32;
    stroke-width: 1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      fill: #a5e085;
      stroke-width: 2;
    }

    &.game-grid__cell--preview {
      fill: rgba(144, 238, 144, 0.6);
      stroke: #32CD32;
      stroke-dasharray: 4;
      stroke-width: 2;
    }

    &.game-grid__cell--occupied {
      fill: transparent;
      stroke: #8B4513;
      stroke-width: 2;
    }

    &.game-grid__cell--road {
      fill: #a0a0a0;
      stroke: #808080;
      stroke-width: 1;
    }
  }

  &__road {
    fill: #a0a0a0;
    stroke: #808080;
    stroke-width: 1;
    pointer-events: none;
  }

  &__preview {
    fill: rgba(144, 238, 144, 0.6);
    stroke: #32CD32;
    stroke-dasharray: 4;
    stroke-width: 2;
    pointer-events: none;
  }

  &__shape {
    fill: var(--shape-color, #8B4513);
    stroke: #78604e;
    stroke-width: 1;
    pointer-events: none;
  }

  &__shape-info {
    font-size: 14px;
    font-weight: bold;
    pointer-events: none;
  }

  &__shape-level {
    fill: rgb(245, 89, 11);
    stroke: #f5f5f5;
    stroke-width: 0.5;
    paint-order: stroke;
    font-size: 12px;
  }

  &__shape-capacity {
    fill: white;
    stroke: #388e3c;
    stroke-width: 1.5;
    paint-order: stroke;
    font-size: 12px;
  }

  &__shape-income {
    fill: rgb(255, 255, 255);
    stroke: #e27d30;
    stroke-width: 1.5;
    paint-order: stroke;
    font-size: 12px;
  }

  &__entrance {
    fill: #4CAF50;
    stroke: #2E7D32;
    stroke-dasharray: 4;
    stroke-width: 2;
    pointer-events: none;
  }

  &__person {
    cursor: pointer;
    transition: all 0.3s ease;
    stroke-width: 2;

    &--waiting {
      fill: #d04b0e;
    }

    &--walking {
      fill: #4CAF50;
    }

    &--inBuilding {
      fill: #2196F3;
    }

    &:hover {
      r: calc(var(--cell-size) / 4);
      stroke-width: 3;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
    }
  }

  &__person-balance {
    font-size: 8px;
    font-weight: bold;
    fill: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    font-family: Arial, sans-serif;
  }

  &__person-warning {
    fill: #ee67a4;
    stroke: white;
    stroke-width: 0.5;
    pointer-events: none;
  }

  &__tooltip-foreign {
    overflow: visible;
    pointer-events: none;
  }
  
  &__tooltip {
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 8px;
    border-radius: 8px;
    font-size: 10px;
    line-height: 1.5;
    white-space: pre-line;
    border: 1px solid #666;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
    word-wrap: break-word;
    font-family: Arial, sans-serif;
  }
}
</style>
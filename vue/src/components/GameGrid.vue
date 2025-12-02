<template>
  <div class="game-grid">
    <div class="game-grid__container" :style="gridStyle">
      <div
        v-for="row in storeGridSizeY"
        :key="row"
        class="game-grid__row"
      >
        <div
          v-for="col in storeGridSizeX"
          :key="col"
          class="game-grid__cell"
          :class="getCellClasses(row - 1, col - 1)"
          @click="() => handleCellClick(row - 1, col - 1)"
          @mouseover="() => handleCellHover(row - 1, col - 1)"
        >
          <div class="game-grid__ground"></div>
          <div 
            v-if="hasShape(row - 1, col - 1)" 
            class="game-grid__shape"
            :style="{ backgroundColor: getShapeColor(row - 1, col - 1) }"
          >
            <div class="game-grid__shape-info">
              <div v-if="getShapeLevel(row - 1, col - 1) > 1" class="game-grid__shape-level">
                Ур.{{ getShapeLevel(row - 1, col - 1) }}
              </div>
              <div v-if="getShapeCapacity(row - 1, col - 1) > 0" class="game-grid__shape-capacity">
                {{ getCurrentVisitors(row - 1, col - 1) }}/{{ getShapeCapacity(row - 1, col - 1) }}
              </div>
              <div v-if="getShapeIncome(row - 1, col - 1) > 0" class="game-grid__shape-income">
                +{{ getShapeIncome(row - 1, col - 1) }}
              </div>
            </div>
          </div>
          <div 
            v-if="isPreviewCell(row - 1, col - 1) && !hasShape(row - 1, col - 1)"
            class="game-grid__preview"
          ></div>
          <div 
            v-if="isRoad(row - 1, col - 1)"
            class="game-grid__road"
          ></div>
        </div>
      </div>
      <div
        class="game-grid__entrance"
        :style="entranceStyle"
      ></div>
      <div
        v-for="person in people"
        :key="person.id"
        class="game-grid__person"
        :style="getPersonStyle(person)"
        :class="getPersonClass(person)"
      >
        <span class="game-grid__person-balance">
          {{ person.balance }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const CELL_SIZE = 50

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

const gridStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  '--grid-size-x': storeGridSizeX.value,
  '--grid-size-y': storeGridSizeY.value
}))

const entranceStyle = computed(() => {
  const entranceRow = Math.floor(storeGridSizeY.value / 2)
  return {
    left: `${-1 * CELL_SIZE}px`,
    top: `${entranceRow * CELL_SIZE}px`,
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`
  }
})

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

const getPersonStyle = (person: any) => {
  return {
    left: `${person.x * CELL_SIZE + CELL_SIZE / 4}px`,
    top: `${person.y * CELL_SIZE + CELL_SIZE / 4}px`,
    width: `${CELL_SIZE / 2}px`,
    height: `${CELL_SIZE / 2}px`
  }
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
}, 500)
</script>

<style scoped lang="less">
.game-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  &__container {
    display: grid;
    grid-template-columns: repeat(var(--grid-size-x), var(--cell-size));
    grid-template-rows: repeat(var(--grid-size-y), var(--cell-size));
    gap: 2px;
    transform: rotateX(45deg) rotateZ(45deg);
    position: relative;
  }

  &__row {
    display: contents;
  }

  &__cell {
    width: var(--cell-size);
    height: var(--cell-size);
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateZ(5px);
      z-index: 10;
    }

    &--preview .game-grid__ground {
      background: rgba(144, 238, 144, 0.6);
      border: 2px dashed #32CD32;
    }

    &--occupied .game-grid__ground {
      background: transparent;
      border: 2px solid #8B4513;
    }

    &--road .game-grid__ground {
      background: #a0a0a0;
      border: 1px solid #808080;
    }
  }

  &__ground {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #b9f795;
    border: 1px solid #32CD32;
  }

  &__shape {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid #654321;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2px;
    box-sizing: border-box;
  }

  &__shape-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    width: 100%;
  }

  &__shape-level {
    background: gold;
    color: black;
    font-size: 8px;
    font-weight: bold;
    padding: 1px 3px;
    border-radius: 3px;
  }

  &__shape-capacity {
    background: rgba(255, 255, 255, 0.9);
    padding: 1px 3px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
    color: #2E7D32;
  }

  &__shape-income {
    background: rgba(255, 215, 0, 0.9);
    padding: 1px 3px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
    color: #8B4513;
  }

  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(144, 238, 144, 0.6);
    border: 2px dashed #32CD32;
    z-index: 6;
  }

  &__road {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #a0a0a0;
    border: 1px solid #808080;
    z-index: 1;
  }

  &__entrance {
    position: absolute;
    background-color: #4CAF50;
    border: 2px dashed #2E7D32;
    z-index: 2;
  }

  &__person {
    position: absolute;
    background: linear-gradient(45deg, #ff6b6b, #ffa500);
    border-radius: 50%;
    border: 2px solid #fff;
    z-index: 20;
    transition: all 0.5s ease;

    &--waiting {
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
    }

    &--walking {
      background: linear-gradient(45deg, #4CAF50, #8BC34A);
    }

    &--inBuilding {
      background: linear-gradient(45deg, #2196F3, #03A9F4);
    }
  }

  &__person-balance {
    font-size: 8px;
    font-weight: bold;
    color: white;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }
}
</style>

<template>
  <div class="game-container">
    <div class="game-grid" :style="gridStyle">
      <div
        v-for="row in gridSizeY"
        :key="row"
        class="grid-row"
      >
        <div
          v-for="col in gridSizeX"
          :key="col"
          class="grid-cell"
          :class="getCellClasses(row - 1, col - 1)"
          @click="handleCellClick(row - 1, col - 1)"
          @mouseover="handleCellHover(row - 1, col - 1)"
        >
          <div v-if="hasShape(row - 1, col - 1)" :class="['shape']">
            <div class="shape-3d">
              <div
                :class="['shape-wall', 'shape-wall-front']"
                :style="getWallStyle(row - 1, col - 1)"
              ></div>
              <div
                :class="['shape-wall', 'shape-wall-right']"
                :style="getWallStyle(row - 1, col - 1)"
              ></div>
              <div
                :class="['shape-wall', 'shape-wall-back']"
                :style="getWallStyle(row - 1, col - 1)"
              ></div>
              <div
                :class="['shape-wall', 'shape-wall-left']"
                :style="getWallStyle(row - 1, col - 1)"
              ></div>
              <div
                class="shape-roof"
                :style="getWallStyle(row - 1, col - 1)"
              ></div>
            </div>
          </div>
          <div v-else class="ground"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const CELL_SIZE = 50

const props = defineProps({
  gridSizeX: {
    type: Number,
    required: true,
  },
  gridSizeY: {
    type: Number,
    required: true,
  },
})

const store = useStore()

const grid = computed(() => store.getters.getGrid)
const selectedShape = computed(() => store.getters.getSelectedShape)
const gameMode = computed(() => store.getters.getGameMode)
const previewCells = computed(() => store.getters.getPreviewCells)
const storeGridSizeX = computed(() => store.getters.getGridSizeX)
const storeGridSizeY = computed(() => store.getters.getGridSizeY)

const gridStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  '--grid-size-x': props.gridSizeX,
  '--grid-size-y': props.gridSizeY
}))

const getShapeColor = (row: number, col: number): string => {
  const cellData = grid.value[row]?.[col]
  return cellData?.color || '#8B4513'
}

const getWallStyle = (row: number, col: number) => {
  return {
    backgroundColor: getShapeColor(row, col)
  }
}

const hasShape = (row: number, col: number): boolean => {
  if (row < 0 || row >= storeGridSizeY.value || col < 0 || col >= storeGridSizeX.value) {
    return false
  }
  return grid.value[row]?.[col] !== null
}

const getCellClasses = (row: number, col: number) => ({
  'cell-occupied': hasShape(row, col),
  'cell-preview': isPreviewCell(row, col)
})

const isPreviewCell = (row: number, col: number): boolean => {
  return previewCells.value.some((cell: any) =>
    cell.row === row && cell.col === col
  )
}

const handleCellHover = (row: number, col: number): void => {
  if (selectedShape.value && gameMode.value === 'add') {
    store.dispatch('updatePreview', { row, col, gridSizeX: props.gridSizeX, gridSizeY: props.gridSizeY })
  } else {
    store.dispatch('clearPreview')
  }
}

const handleCellClick = (row: number, col: number): void => {
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
      break
    }

    if (hasShape(targetRow, targetCol)) {
      canAdd = false
      alert('Нельзя разместить фигуру - место занято')
      break
    }
  }

  if (canAdd) {
    store.dispatch('addShape', { 
      startRow: row, 
      startCol: col, 
      shape,
      gridSizeX: props.gridSizeX,
      gridSizeY: props.gridSizeY
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
    gridSizeX: props.gridSizeX,
    gridSizeY: props.gridSizeY
  })
}

onMounted(() => {
  store.dispatch('initializeGrid', { 
    gridSizeX: props.gridSizeX, 
    gridSizeY: props.gridSizeY 
  })
})

watch(
  () => [props.gridSizeX, props.gridSizeY],
  () => {
    store.dispatch('initializeGrid', { 
      gridSizeX: props.gridSizeX, 
      gridSizeY: props.gridSizeY 
    })
  }
)
</script>

<style scoped>

.game-container {
  perspective: 1000px;
  padding: 40px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-size-x), var(--cell-size));
  grid-template-rows: repeat(var(--grid-size-y), var(--cell-size));
  transform: rotateX(60deg) rotateZ(45deg);
  transform-style: preserve-3d;
  gap: 2px;
}

.grid-row {
  display: contents;
}

.grid-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ground {
  width: 100%;
  height: 100%;
  background: #b9f795;
  border: 1px solid #32CD32;
  transform: translateZ(0px);
}

.shape {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.shape-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: translateZ(10px);
}

.shape-wall {
  position: absolute;
  border: 1px solid #654321;
}

.shape-wall-front {
  width: 100%;
  height: 20px;
  bottom: 0;
  transform-origin: bottom;
  transform: rotateX(90deg);
}

.shape-wall-right {
  width: 20px;
  height: 100%;
  right: 0;
  transform-origin: right;
  transform: rotateY(90deg);
}

.shape-wall-back {
  width: 100%;
  height: 20px;
  top: 0;
  transform-origin: top;
  transform: rotateX(-90deg);
}

.shape-wall-left {
  width: 20px;
  height: 100%;
  left: 0;
  transform-origin: left;
  transform: rotateY(-90deg);
}

.shape-roof {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateZ(20px);
  border: 1px solid #8B0000;
}

.cell-preview .ground {
  background: rgba(144, 238, 144, 0.6);
  border: 2px dashed #32CD32;
}


.cell-occupied .ground {
  background: transparent;
  border: 2px solid #8B4513;
}

.grid-cell:hover {
  transform: translateZ(5px);
  z-index: 10;
}
</style>


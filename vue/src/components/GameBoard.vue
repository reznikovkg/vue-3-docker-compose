<template>
  <div
    class="game-board"
    :style="boardStyle"
    @click="(event) => handleClick(event)"
  >
    <div
      v-for="(rowArray, rowIndex) in grid"
      :key="rowIndex"
      class="game-board__row"
    >
      <div
        v-for="(cellData, colIndex) in rowArray"
        :key="colIndex"
        class="game-board__cell"
        :class="{
          'game-board__cell--occupied': cellData.isOccupied,
        }"
        :style="{
          '--row': rowIndex,
          '--col': colIndex,
          backgroundColor: getCellBackgroundColor(rowIndex, colIndex, grid, gridWidth, gridHeight, cellData),
          borderColor: getCellBorderColor(rowIndex, colIndex, grid, gridWidth, gridHeight, cellData)
        }"
        @mouseover="() => hoverCell(rowIndex, colIndex)"
      >
      </div>
    </div>
    <div v-if="entrance.row !== -1 && entrance.col !== -1"
         class="game-board__entrance"
         :style="{
           '--row': entrance.row,
           '--col': entrance.col,
           backgroundColor: getCellBackgroundColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
           borderColor: getCellBorderColor(entrance.row, entrance.col, grid, gridWidth, gridHeight, null),
           left: `calc(${entrance.col} * var(--cell-size))`,
           top: `calc(${entrance.row} * var(--cell-size))`,
           width: 'var(--cell-size)',
           height: 'var(--cell-size)',
         }">
    </div>
    <div v-for="visitor in visitors" :key="visitor.id"
     :style="{ '--visitor-x': visitor.x, '--visitor-y': visitor.y }"
     class="game-board__visitor-ball">
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted} from 'vue';
import { useStore } from 'vuex';
import { getCellLogic, CELL_SIZE } from '../modules/cellLogicModule.js';

const store = useStore();
const emit = defineEmits(['cell-clicked']);

const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const grid = computed(() => store.getters.getGrid);
const selectedObject = computed(() => store.getters.getSelectedObject);
const gameMode = computed(() => store.getters.getGameMode);
const entrance = computed(() => store.getters.getEntrance);
const visitors = computed(() => store.getters.activeVisitors);

const highlightedCells = ref([]);
const hoveredCell = ref({ row: -1, col: -1 });
const isPlacementPossible = ref(true);

const componentContext = {
    highlightedCells,
    selectedObject,
    gameMode
};

const {
  getCellBackgroundColor,
  getCellBorderColor,
  isValidCell,
  isCellOccupied
} = getCellLogic(store, componentContext);

const boardStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  '--grid-width': gridWidth.value,
  '--grid-height': gridHeight.value
}));

const handleClick = (event) => {
    const targetCell = event.target.closest('.game-board__cell');
    if (!targetCell) {
        return;
    }
    const row = parseInt(targetCell.style.getPropertyValue('--row'));
    const col = parseInt(targetCell.style.getPropertyValue('--col'));
    const currentMode = gameMode.value;
    emit('cell-clicked', { row, col, gameMode: currentMode });
    if (currentMode === 'place' && isPlacementPossible.value) {
        store.dispatch('placeObject', { originRow: row, originCol: col });
        updatePreviewPlacement();  
    } else if (currentMode === 'place' && !isPlacementPossible.value) {
        if (highlightedCells.value.some(cell => !isValidCell(cell.row, cell.col, gridWidth.value, gridHeight.value))) {
            alert("Невозможно разместить: выходит за границы поля");
        } else if (highlightedCells.value.some(cell => isCellOccupied(cell.row, cell.col, grid.value, gridWidth.value, gridHeight.value))) {
            alert("Невозможно разместить: ячейки заняты");
        }
    }
    else if (currentMode === 'delete') {
        store.dispatch('deleteObject', { row: row, col: col });
        updatePreviewPlacement();
    }
}; 

const updatePreviewPlacement = () => {
  if (!selectedObject.value || gameMode.value !== 'place') 
  {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }
  const originRow = hoveredCell.value.row;
  const originCol = hoveredCell.value.col;
  if (originRow < 0 || originCol < 0) 
  {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }
  const objectShape = selectedObject.value.shape;
  const previewCells = [];
  let canPlace = true;
  let outOfBounds = false;
  let cellOccupied = false;
  for (const shapePart of objectShape) 
  {
    const targetRow = originRow + shapePart.y;
    const targetCol = originCol + shapePart.x;
    let isCurrentCellError = false;
    if (!isValidCell(targetRow, targetCol, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
      outOfBounds = true;
    } 
    else if (isCellOccupied(targetRow, targetCol, grid.value, gridWidth.value, gridHeight.value)) 
    {
      canPlace = false;
      isCurrentCellError = true;
      cellOccupied = true;
    }
    previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
  }
  isPlacementPossible.value = canPlace;
  highlightedCells.value = previewCells;
};
const hoverCell = (row, col) => {
  hoveredCell.value = { row, col };
  updatePreviewPlacement();
};
onMounted(() => {
  store.dispatch('initializeGrid');
  store.dispatch('startVisitorSpawning');

  movementInterval = setInterval(() => {
    store.dispatch('stepAllVisitors');
  }, 700);
});

onUnmounted(() => {
  store.dispatch('stopVisitorSpawning');
  if (movementInterval) {
    clearInterval(movementInterval);
  }
});
</script>

<style scoped lang="less">
.game-board {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: auto;
  height: auto;
  transform: rotate(-60deg) skewY(30deg);
  border: 2px solid #000000;
  
  &__row {
    display: flex;
    transform: skewY(0deg); 
  }
  
  &__cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border: 1px solid;
    box-sizing: border-box;
    position: relative;
    margin: 0;
  }
  &__entrance {
    width: var(--cell-size);
    height: var(--cell-size);
    box-sizing: border-box;
    position: absolute; 
    z-index: 2; 
    border-width: 2px; 
  }
  &__visitor-ball {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: blue;
    position: absolute;
    z-index: 3;
    left: calc(var(--cell-size) * var(--visitor-x));
    top: calc(var(--cell-size) * var(--visitor-y));
    transform: translate(50%, 50%);
    transition: left 0.5s, top 0.5s;
  }
}
</style>
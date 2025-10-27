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
          'game-board__cell--highlighted-preview': isCellHighlightedPreview(rowIndex, colIndex, highlightedCells, selectedObject, gameMode),
          'game-board__cell--highlighted-error': isCellHighlightedError(rowIndex, colIndex, highlightedCells, selectedObject, gameMode),
          'game-board__cell--can-place': isPlacementPossible && isCellHighlightedPreview(rowIndex, colIndex, highlightedCells, selectedObject, gameMode),
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { getCellLogic, CELL_SIZE } from '../modules/cellLogicModule.js';

const store = useStore();
const emit = defineEmits(['cell-clicked']);

const {
  getCellBackgroundColor,
  getCellBorderColor,
  isCellHighlightedPreview,
  isCellHighlightedError,
  isValidCell,
  isCellOccupied
} = getCellLogic(store);

const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const grid = computed(() => store.getters.getGrid);
const selectedObject = computed(() => store.getters.getSelectedObject);
const gameMode = computed(() => store.getters.getGameMode);

const highlightedCells = ref([]);
const hoveredCell = ref({ row: -1, col: -1 });
const isPlacementPossible = ref(true);

onMounted(() => {
  store.dispatch('initializeGrid');
});

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
  if (!selectedObject.value || gameMode.value !== 'place') {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }

  const originRow = hoveredCell.value.row;
  const originCol = hoveredCell.value.col;

  if (originRow < 0 || originCol < 0) {
    highlightedCells.value = [];
    isPlacementPossible.value = true;
    return;
  }

  const objectShape = selectedObject.value.shape;
  const previewCells = [];
  let canPlace = true;
  let outOfBounds = false;
  let cellOccupied = false;

  for (const shapePart of objectShape) {
    const targetRow = originRow + shapePart.y;
    const targetCol = originCol + shapePart.x;

    let isCurrentCellError = false;

    if (!isValidCell(targetRow, targetCol, gridWidth.value, gridHeight.value)) {
      canPlace = false;
      isCurrentCellError = true;
      outOfBounds = true;
    } else if (isCellOccupied(targetRow, targetCol, grid.value, gridWidth.value, gridHeight.value)) {
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
    border: 1px solid #73f173;
    box-sizing: border-box;
    position: relative;
    margin: 0;

    &--highlighted-preview {
      background-color: rgba(76, 175, 80, 0.5) !important;
      border-color: green !important;
    }

    &--highlighted-error {
      background-color: rgba(255, 0, 0, 0.5) !important;
      border-color: red !important;
    }

    &--can-place {
          background-color: rgba(76, 175, 80, 0.5) !important;
          border-color: green !important;
        }
  }
}
</style>
<template>
  <div
    class="game-board"
    :style="boardStyle"
    @mousemove="(event) => handleMouseMove(event)"
    @click="(event) => handleClick(event)"
  >
    <div v-for="row in gridHeight" :key="row" class="board-row">
      <div
        v-for="col in gridWidth"
        :key="col"
        :ref="`cell-${row}-${col}`"
        class="grid-cell"
        :class="{
          'cell-occupied': isCellOccupied(row - 1, col - 1),
          'cell-highlighted-preview': isCellHighlightedPreview(row - 1, col - 1),
          'cell-highlighted-error': isCellHighlightedError(row - 1, col - 1),
        }"
        :style="{
          '--row': row - 1,
          '--col': col - 1,
          backgroundColor: getCellBackgroundColor(row - 1, col - 1),
          borderColor: getCellBorderColor(row - 1, col - 1),
        }"
        @mouseover="(event) => hoverCell(row - 1, col - 1, event)"
      >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const CELL_SIZE = 40;

const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const selectedObject = computed(() => store.getters.getSelectedObject);
const gameMode = computed(() => store.getters.getGameMode);
const grid = computed(() => store.getters.getGrid);
const allPlacedObjects = computed(() => store.getters.getAllPlacedObjects);

const highlightedCells = ref([]);
const isPlacementPossible = ref(true);
const hoveredCell = ref({ row: -1, col: -1 });

const boardStyle = computed(() => ({
  '--cell-size': `${CELL_SIZE}px`,
  '--grid-width': gridWidth.value,
  '--grid-height': gridHeight.value,
}));

const isCellOccupied = (row, col) => {
  if (row < 0 || row >= gridHeight.value || col < 0 || col >= gridWidth.value) {
    return true;
  }
  return grid.value[row][col] !== null;
};

const getCellBackgroundColor = (row, col) => {
  const cellData = grid.value[row]?.[col];
  if (cellData !== null && cellData.color) {
    return cellData.color;
  }
  return '#a1f1ad';
};

const getCellBorderColor = (row, col) => {
  const cellData = grid.value[row]?.[col];
  if (cellData !== null && cellData.color) {
    return cellData.color;
  }
  return '#73f173';
};

const updatePreviewPlacement = () => {
  if (!selectedObject.value || gameMode.value !== 'place') {
    highlightedCells.value = [];
    return;
  }

  const originRow = hoveredCell.value.row;
  const originCol = hoveredCell.value.col;

  if (originRow < 0 || originCol < 0) {
    highlightedCells.value = [];
    return;
  }

  const objectShape = selectedObject.value.shape;
  const previewCells = [];
  let canPlace = true;

  for (const shapePart of objectShape) {
    const targetRow = originRow + shapePart.y;
    const targetCol = originCol + shapePart.x;

    let isCurrentCellError = false;

    if (targetRow < 0 || targetRow >= gridHeight.value || targetCol < 0 || targetCol >= gridWidth.value) {
      canPlace = false;
      isCurrentCellError = true;
    } else if (isCellOccupied(targetRow, targetCol)) {
      canPlace = false;
      isCurrentCellError = true;
    }

    previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
  }

  isPlacementPossible.value = canPlace;
  highlightedCells.value = previewCells;
};

const isCellHighlightedPreview = (row, col) => {
  if (!selectedObject.value || gameMode.value !== 'place' || !highlightedCells.value) {
    return false;
  }
  return highlightedCells.value.some(h => h.row === row && h.col === col && !h.isError);
};

const isCellHighlightedError = (row, col) => {
  if (!selectedObject.value || gameMode.value !== 'place' || !highlightedCells.value) {
    return false;
  }
  return highlightedCells.value.some(h => h.row === row && h.col === col && h.isError);
};

const hoverCell = (row, col) => {
  hoveredCell.value = { row, col };

  if (selectedObject.value && gameMode.value === 'place') {
    updatePreviewPlacement();
  } else if (gameMode.value === 'delete') {
    const cellData = grid.value[row]?.[col];
    if (cellData) {
      const objectId = cellData.objectId;
      const cellsToHighlight = [];
      const objectInfo = allPlacedObjects.value.find(obj => obj.id === objectId);

      if (objectInfo) {
        objectInfo.shape.forEach(shapePart => {
          const targetRow = objectInfo.origin.row + shapePart.y;
          const targetCol = objectInfo.origin.col + shapePart.x;
          if (targetRow >= 0 && targetRow < gridHeight.value && targetCol >= 0 && targetCol < gridWidth.value) {
            cellsToHighlight.push({ row: targetRow, col: targetCol, isError: false });
          }
        });
      }
      highlightedCells.value = cellsToHighlight;
    } else {
      highlightedCells.value = [];
    }
  } else {
    highlightedCells.value = [];
  }
};

const handleClick = (event) => {
  const targetCell = event.target.closest('.grid-cell');
  if (!targetCell) return;

  const row = parseInt(targetCell.style.getPropertyValue('--row'));
  const col = parseInt(targetCell.style.getPropertyValue('--col'));

  if (gameMode.value === 'place') {
    store.dispatch('placeObject', { originRow: row, originCol: col });
  } else if (gameMode.value === 'delete') {
    store.dispatch('deleteObject', { row: row, col: col });
  }
};

store.dispatch('initializeGrid');
</script>

<style scoped>
.game-board {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: auto;
  height: auto;
  transform: rotate(-45deg) skewY(35deg);
  border: 2px solid #000000;
}

.board-row {
  display: flex;
  transform: skewY(0deg);
}

.grid-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border: 1px solid #73f173;
  box-sizing: border-box;
  position: relative;
  margin: 0;
}

.cell-highlighted-preview {
  background-color: rgba(76, 175, 80, 0.5) !important;
  border-color: green !important;
}

.cell-highlighted-error {
  background-color: rgba(255, 0, 0, 0.5) !important;
  border-color: red !important;
}
</style>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export const CELL_SIZE = 40; 

export function useCellAnalysis() {
  const store = useStore();

  const gridWidth = computed(() => store.getters.getGridWidth);
  const gridHeight = computed(() => store.getters.getGridHeight);
  const selectedObject = computed(() => store.getters.getSelectedObject);
  const gameMode = computed(() => store.getters.getGameMode);
  const grid = computed(() => store.getters.getGrid); 
  const allPlacedObjects = computed(() => store.getters.getAllPlacedObjects);

  const highlightedCells = ref([]);
  const isPlacementPossible = ref(true); 
  const hoveredCell = ref({ row: -1, col: -1 }); 

  const isCellOccupied = (row, col) => {
    
    if (row < 0 || row >= gridHeight.value || col < 0 || col >= gridWidth.value) {
      return true; 
    }
    return grid.value[row]?.[col]?.isOccupied || false;
  };

  const getCellBackgroundColor = (row, col) => {
    if (row < 0 || row >= gridHeight.value || col < 0 || col >= gridWidth.value) {
      return '#a1f1ad'; 
    }
    const cell = grid.value[row]?.[col]; 
    if (cell && cell.isOccupied && cell.occupyingObjectColor) {
      return cell.occupyingObjectColor;
    }
    return '#a1f1ad'; 
  };

  const getCellBorderColor = (row, col) => {
    if (row < 0 || row >= gridHeight.value || col < 0 || col >= gridWidth.value) {
      return '#73f173'; 
    }
    const cell = grid.value[row]?.[col]; 
    if (cell && cell.isOccupied && cell.occupyingObjectColor) {
      return cell.occupyingObjectColor;
    }
    return '#73f173';
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
      }
      else if (isCellOccupied(targetRow, targetCol)) {
        canPlace = false;
        isCurrentCellError = true;
      }

      previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
    }

    isPlacementPossible.value = canPlace; 
    highlightedCells.value = previewCells;
  };

  const hoverCell = (row, col) => {
    hoveredCell.value = { row, col }; 

    if (selectedObject.value && gameMode.value === 'place') {
      updatePreviewPlacement();
    } else if (gameMode.value === 'delete') {
      const cell = grid.value[row]?.[col]; 
      if (cell && cell.isOccupied && cell.occupyingObjectId) {
        const objectId = cell.occupyingObjectId;
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

  return {
    highlightedCells,
    isPlacementPossible,
    hoveredCell,
    isCellOccupied,
    getCellBackgroundColor,
    getCellBorderColor,
    isCellHighlightedPreview,
    isCellHighlightedError,
    hoverCell,
    updatePreviewPlacement
  };
}
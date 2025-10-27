export const CELL_SIZE = 40;

export const getCellLogic = (store, componentInstance) => {
  
  const getGridData = () => ({
      gridWidth: store.getters.getGridWidth,
      gridHeight: store.getters.getGridHeight,
      grid: store.getters.getGrid,
      selectedObject: store.getters.getSelectedObject,
      gameMode: store.getters.getGameMode,
      allPlacedObjects: store.getters.getAllPlacedObjects,
  });

  const isValidCell = (row, col, width, height) => {
    return row >= 0 && row < height && col >= 0 && col < width;
  };
  
  const isCellOccupied = (row, col, grid, width, height) => {
    if (!isValidCell(row, col, width, height)) return true;
    return grid[row]?.[col]?.isOccupied || false;
  };

  const getCellBackgroundColor = (row, col, grid, width, height, cellData) => {
    if (!isValidCell(row, col, width, height)) return '#a1f1ad';
    
    if (cellData && cellData.isOccupied && cellData.occupyingObjectColor) {
      return cellData.occupyingObjectColor;
    }
    return '#a1f1ad';
  };

  const getCellBorderColor = (row, col, grid, width, height, cellData) => {
    if (!isValidCell(row, col, width, height)) return '#73f173';
    
    if (cellData && cellData.isOccupied && cellData.occupyingObjectColor) {
      return cellData.occupyingObjectColor;
    }
    return '#73f173';
  };

  const isCellHighlightedPreview = (row, col, highlightedCells, selectedObject, gameMode) => {
    if (!selectedObject || gameMode !== 'place' || !highlightedCells) return false;
    return highlightedCells.some(h => h.row === row && h.col === col && !h.isError);
  };

  const isCellHighlightedError = (row, col, highlightedCells, selectedObject, gameMode) => {
    if (!selectedObject || gameMode !== 'place' || !highlightedCells) return false;
    return highlightedCells.some(h => h.row === row && h.col === col && h.isError);
  };

  return {
    CELL_SIZE,
    getGridData,
    isValidCell,
    isCellOccupied,
    getCellBackgroundColor,
    getCellBorderColor,
    isCellHighlightedPreview,
    isCellHighlightedError,
  };
};
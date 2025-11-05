export const CELL_SIZE = 40;

export const getCellLogic = (store, componentInstanceContext) => {
  const { highlightedCells, selectedObject, gameMode } = componentInstanceContext;

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
    if (!isValidCell(row, col, width, height)) 
    {
      return true;
    }
    return grid[row]?.[col]?.isOccupied || false;
  };

  const getCellBackgroundColor = (row, col, grid, width, height, cellData) => {
    if (!isValidCell(row, col, width, height)) return 'rgba(161, 241, 173, 1)';

    const highlightedInfo = highlightedCells.value.find(h => h.row === row && h.col === col);

    if (selectedObject.value && gameMode.value === 'place' && highlightedInfo) 
    {
      if (highlightedInfo.isError) 
      {
        return 'rgba(255, 0, 0, 0.5)'; 
      } 
      else
      {
        return 'rgba(76, 175, 80, 0.5)'; 
      }
    }

    if (cellData && cellData.isOccupied && cellData.occupyingObjectColor) 
    {
      return cellData.occupyingObjectColor;
    }
    return 'rgba(161, 241, 173, 1)';
  };

  const getCellBorderColor = (row, col, grid, width, height, cellData) => {
    if (!isValidCell(row, col, width, height)) 
    {
      return 'rgba(115, 241, 115, 1 )'; 
    }

    const highlightedInfo = highlightedCells.value.find(h => h.row === row && h.col === col);

    if (selectedObject.value && gameMode.value === 'place' && highlightedInfo) 
    {
      if (highlightedInfo.isError) 
      {
        return 'rgba(255, 0, 0, 0.5)'; 
      }
      else 
      {
        return 'rgba(76, 175, 80, 0.5)'; 
      }
    }

    if (cellData && cellData.isOccupied && cellData.occupyingObjectColor) 
    {
      return cellData.occupyingObjectColor;
    }
    return 'rgba(115, 241, 115, 1)';
  };

  return {
    CELL_SIZE,
    getGridData,
    isValidCell,
    isCellOccupied,
    getCellBackgroundColor,
    getCellBorderColor
  };
};
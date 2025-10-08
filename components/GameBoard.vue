<template>
  <div
    class="game-board"
    :style="boardStyle"
    @mousemove="handleMouseMove"
    @click="handleClick"
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
        @mouseover="hoverCell(row - 1, col - 1)"
      >
      </div>
    </div>
  </div>
</template>

<script>
const CELL_SIZE = 40; 

export default {
  name: 'GameBoard',
  props: {
    gridWidth: {
      type: Number,
      default: 10, 
    },
    gridHeight: {
      type: Number,
      default: 10, 
    },
    selectedObject: {
      type: Object,
      default: null,
    },
    gameMode: {
      type: String,
      default: 'place', 
    },
  },
  data: () => ({ 
    grid: [],
    highlightedCells: [],
    isPlacementPossible: true,
    hoveredCell: { row: -1, col: -1 },
    cellSize: CELL_SIZE,
    nextObjectId: 1,
    allPlacedObjects: []
  }),
  watch: {
    gridWidth() {
      this.initializeGrid();
    },
    gridHeight() {
      this.initializeGrid();
    },
    selectedObject() {
      this.highlightedCells = [];
      this.isPlacementPossible = true;
    },
  },
  created() {
    this.initializeGrid();
  },
  computed: {
      boardStyle() {
          return {
            '--cell-size': `${this.cellSize}px`,
            '--grid-width': this.gridWidth, 
            '--grid-height': this.gridHeight
          };
      }
  },
  methods: {
    initializeGrid() {
      this.grid = Array(this.gridHeight)
        .fill(null)
        .map(() => Array(this.gridWidth).fill(null));
      this.allPlacedObjects = [];
      this.nextObjectId = 1; 
      this.$emit('update-grid', this.grid);
    },

    isCellOccupied(row, col) {
      if (row < 0 || row >= this.gridHeight || col < 0 || col >= this.gridWidth) {
        return true;
      }
      return this.grid[row][col] !== null;
    },
    
    getCellBackgroundColor(row, col) {
      const cellData = this.grid[row]?.[col]; 
      if (cellData !== null && cellData.color) {
        return cellData.color;
      }
      return '#a1f1ad'; 
    },

    getCellBorderColor(row, col) {
      const cellData = this.grid[row]?.[col]; 
      if (cellData !== null && cellData.color) {
        return cellData.color; 
      }
      return '#73f173'; 
    },

    hoverCell(row, col) {
      this.hoveredCell = { row, col };
      
      if (this.selectedObject && this.gameMode === 'place') {
        this.updatePreviewPlacement();
      } else if (this.gameMode === 'delete') {
        const cellData = this.grid[row]?.[col];
        if (cellData) {
          const objectId = cellData.objectId;
          const cellsToHighlight = [];
          const objectInfo = this.allPlacedObjects.find(obj => obj.id === objectId);

          if (objectInfo) {
            objectInfo.shape.forEach(shapePart => {
              const targetRow = objectInfo.origin.row + shapePart.y;
              const targetCol = objectInfo.origin.col + shapePart.x;
              if (targetRow >= 0 && targetRow < this.gridHeight && targetCol >= 0 && targetCol < this.gridWidth) {
                cellsToHighlight.push({ row: targetRow, col: targetCol, isError: false });
              }
            });
          }
          this.highlightedCells = cellsToHighlight;
        } else {
          this.highlightedCells = [];
        }
      } else {
        this.highlightedCells = [];
      }
    },

    updatePreviewPlacement() {
      if (!this.selectedObject || this.gameMode !== 'place') {
        this.highlightedCells = [];
        return;
      }

      const originRow = this.hoveredCell.row;
      const originCol = this.hoveredCell.col;

      if (originRow < 0 || originCol < 0) {
          this.highlightedCells = [];
          return;
      }

      const objectShape = this.selectedObject.shape;
      const previewCells = [];
      let canPlace = true;

      for (const shapePart of objectShape) {
        const targetRow = originRow + shapePart.y;
        const targetCol = originCol + shapePart.x;

        let isCurrentCellError = false; 

        if (targetRow < 0 || targetRow >= this.gridHeight || targetCol < 0 || targetCol >= this.gridWidth) {
          canPlace = false;
          isCurrentCellError = true;
        } else if (this.isCellOccupied(targetRow, targetCol)) {
          canPlace = false;
          isCurrentCellError = true;
        }

        previewCells.push({ row: targetRow, col: targetCol, isError: isCurrentCellError });
      }

      this.isPlacementPossible = canPlace; 
      this.highlightedCells = previewCells; 
    },

    isCellHighlightedPreview(row, col) {
      if (!this.selectedObject || this.gameMode !== 'place' || !this.highlightedCells) {
        return false;
      }
      return this.highlightedCells.some(h => h.row === row && h.col === col && !h.isError);
    },

    isCellHighlightedError(row, col) {
      if (!this.selectedObject || this.gameMode !== 'place' || !this.highlightedCells) {
        return false;
      }
      return this.highlightedCells.some(h => h.row === row && h.col === col && h.isError);
    },

    handleClick(event) {
      const targetCell = event.target.closest('.grid-cell');
      if (!targetCell) return;

      const row = parseInt(targetCell.style.getPropertyValue('--row'));
      const col = parseInt(targetCell.style.getPropertyValue('--col'));

      if (this.gameMode === 'place') {
        this.placeObject(row, col);
      } else if (this.gameMode === 'delete') {
        this.deleteObject(row, col);
      }
    },

    placeObject(originRow, originCol) {
      if (!this.selectedObject || this.gameMode !== 'place') return;

      const objectShape = this.selectedObject.shape;
      const cellsToOccupy = [];
      let canPlace = true;

      for (const shapePart of objectShape) {
        const targetRow = originRow + shapePart.y;
        const targetCol = originCol + shapePart.x;

        if (targetRow < 0 || targetRow >= this.gridHeight || targetCol < 0 || targetCol >= this.gridWidth) {
          canPlace = false;
          alert('Объект выходит за границы поля');
          break;
        }
        if (this.isCellOccupied(targetRow, targetCol)) {
          canPlace = false;
          alert('Невозможно разместить объект: клетки заняты');
          break;
        }
        cellsToOccupy.push({ row: targetRow, col: targetCol });
      }

      if (canPlace) {
        const newObjectId = this.nextObjectId++;
        const placedObjectData = {
          id: newObjectId,
          color: this.selectedObject.color, 
          shape: this.selectedObject.shape, 
          origin: { row: originRow, col: originCol }
        };

        cellsToOccupy.forEach(({ row, col }) => {
          this.grid[row][col] = {
            objectId: newObjectId,
            color: placedObjectData.color,
          };
        });

        this.allPlacedObjects.push(placedObjectData);
        this.highlightedCells = [];
        this.$emit('update-grid', this.grid);
      }
      this.selectedObject = null; 
    },

    deleteObject(row, col) {
      if (this.gameMode !== 'delete') return;

      const cellData = this.grid[row]?.[col];

      if (cellData === null || !cellData.objectId) {
        return;
      }
        
      const objectIdToDelete = cellData.objectId;
      const objectIndex = this.allPlacedObjects.findIndex(obj => obj.id === objectIdToDelete);

      const objectToDelete = this.allPlacedObjects[objectIndex];

      objectToDelete.shape.forEach(shapePart => {
        const targetRow = objectToDelete.origin.row + shapePart.y;
        const targetCol = objectToDelete.origin.col + shapePart.x;

        if (targetRow >= 0 && targetRow < this.gridHeight && targetCol >= 0 && targetCol < this.gridWidth) {
          if (this.grid[targetRow][targetCol]?.objectId === objectIdToDelete) {
            this.grid[targetRow][targetCol] = null;
          }
        }
      });

      this.allPlacedObjects.splice(objectIndex, 1);
      this.highlightedCells = [];
      this.$emit('update-grid', this.grid); 
      alert("Объект удалён");
    },

    isCellHighlighted(row, col) {
      return this.highlightedCells.some(h => h.row === row && h.col === col);
    }
  }
};
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
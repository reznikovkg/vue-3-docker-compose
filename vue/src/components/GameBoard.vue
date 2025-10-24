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
        :ref="`cell-${rowIndex}-${colIndex}`"
        class="game-board__cell"
        :class="{
          'game-board__cell--occupied': cellData.isOccupied,
          'game-board__cell--highlighted-preview': isCellHighlightedPreview(rowIndex, colIndex),
          'game-board__cell--highlighted-error': isCellHighlightedError(rowIndex, colIndex)
        }"
        :style="{
          '--row': rowIndex,
          '--col': colIndex,
          backgroundColor: getCellBackgroundColor(rowIndex, colIndex),
          borderColor: getCellBorderColor(rowIndex, colIndex)
        }"
        @mouseover="(event) => hoverCell(rowIndex, colIndex, event)"
      >
      </div>
    </div>
  </div>
</template>

<script>
import { useCellAnalysis, CELL_SIZE } from '../composables/cellLogicAnalyzer.js';

export default {
  name: 'GameBoard',
  emits: ['cell-clicked'], 
  data() {
    return {
      getCellBackgroundColor: () => {},
      getCellBorderColor: () => {},
      isCellHighlightedPreview: () => {},
      isCellHighlightedError: () => {},
      hoverCell: () => {}
    };
  },
  computed: {
    gridWidth() {
      return this.$store.getters.getGridWidth;
    },
    gridHeight() {
      return this.$store.getters.getGridHeight;
    },
    grid() {
      return this.$store.getters.getGrid; 
    },
    boardStyle() {
      return {
        '--cell-size': `${CELL_SIZE}px`,
        '--grid-width': this.gridWidth, 
        '--grid-height': this.gridHeight
      };
    },
  },
  methods: {
    handleClick(event) {
      const targetCell = event.target.closest('.game-board__cell'); 
      if (!targetCell) {
        return;
      }

      const row = parseInt(targetCell.style.getPropertyValue('--row'));
      const col = parseInt(targetCell.style.getPropertyValue('--col'));

      const gameMode = this.$store.getters.getGameMode;

      this.$emit('cell-clicked', { row, col, gameMode });

      if (gameMode === 'place') {
        this.$store.dispatch('placeObject', { originRow: row, originCol: col });
      } else if (gameMode === 'delete') {
        this.$store.dispatch('deleteObject', { row: row, col: col });
      }
    },
  },
  mounted() {
    const {
      getCellBackgroundColor,
      getCellBorderColor,
      isCellHighlightedPreview,
      isCellHighlightedError,
      hoverCell
    } = useCellAnalysis();

    this.getCellBackgroundColor = getCellBackgroundColor;
    this.getCellBorderColor = getCellBorderColor;
    this.isCellHighlightedPreview = isCellHighlightedPreview;
    this.isCellHighlightedError = isCellHighlightedError;
    this.hoverCell = hoverCell;

    this.$store.dispatch('initializeGrid');
  },
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
  
  --grid-width: 10;  
  --grid-height: 10; 
  
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
  }
}
</style>
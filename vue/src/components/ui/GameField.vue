<template>
  <div class = "field" :style = "fieldStyle">
    <div 
      v-for = "(row, rowIndex) in rows" 
      :key = "'row-' + rowIndex"
      class = "field__row"
    >
      <div 
        v-for = "(col, colIndex) in cols" 
        :key = "'cell-' + rowIndex + '-' + colIndex"
        class = "field__cell"
        :class = "{
          'field__cell--base': rowIndex === baseRow && colIndex === baseCol,
          'field__cell--attached': !(rowIndex === baseRow && colIndex === baseCol) && isAttached(rowIndex, colIndex)
        }"
      >
        <span v-if = "isAttached(rowIndex, colIndex)" class = "island-symbol">◼</span>
        <span v-else class = "cell-coords"></span>
      </div>
    </div>
    
    <Figure 
      v-if = "figureRow !== -1 && figureCol !== -1"
      :row = "figureRow"
      :col = "figureCol"
    />
  </div>
</template>

<script>
import Figure from './Figure.vue'

export default {
  name: 'GameField',
  components: { Figure },
  props: {
    gridSize: Number, //размер поля
    islandCells: Array, //массив координат клеток острова
    baseRow: Number, //ряд базовой клетки
    baseCol: Number, //столбец базовой клетки
    figureRow: Number, //ряд летящей фигуры
    figureCol: Number //столбец летящей фигуры
  },
  data() {
    return {
      cellSize: 50
    }
  },
  computed: {
    rows() {
      return Array(this.gridSize).fill(0)
    },
    cols() {
      return Array(this.gridSize).fill(0)
    },
    fieldStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${this.gridSize}, ${this.cellSize}px)`,
        gap: '2px',
        background: '#ccc',
        padding: '2px',
        position: 'relative',
        width: 'fit-content'
      }
    }
  },
  methods: {
    //является ли клетка частью острова?
    isAttached(row, col) {
      return this.islandCells.some(cell => cell[0] === row && cell[1] === col)
    }
  }
}
</script>

<style scoped lang="scss">
.field {
  &__row {
    display: contents;
  }
  &__cell {
    width: v-bind('cellSize + "px"');
    height: v-bind('cellSize + "px"');
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #666;

    &--base {
      background: #4caf50;
      color: white;
      font-weight: bold;
    }
    &--attached {
      background: #ff9800;
      color: white;
      font-weight: bold;
    }
  }
}
.cell-coords {
  opacity: 0.7;
}
.island-symbol {
  font-size: 24px;
}
</style>

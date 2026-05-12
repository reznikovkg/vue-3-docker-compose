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

    <div v-for = "(cell, index) in figureCells" :key = "index">
      <Figure 
        :row="cell.row" 
        :col="cell.col" 
        :cellSize="cellSize"
        :color="currentFigure.color"
      />
    </div>
  
    <div v-for = "(bomb, index) in bombs.black" :key = "'bomb-black-' + index">
      <Bomb 
        :row="bomb.row" 
        :col="bomb.col" 
        :cellSize="cellSize"
        type="black"
      />
    </div>

    <div v-for = "(bomb, index) in bombs.red" :key = "'bomb-red-' + index">
      <Bomb 
        :row="bomb.row" 
        :col="bomb.col" 
        :cellSize="cellSize"
        type="red"
      />
    </div>

    <div v-for = "(bomb, index) in bombs.green" :key = "'bomb-green-' + index">
      <Bomb 
        :row="bomb.row" 
        :col="bomb.col" 
        :cellSize="cellSize"
        type="green"
      />
    </div>
  </div>
</template>

<script>
import Figure from './Figure.vue'
import Bomb from './Bomb.vue'

export default {
  name: 'GameField',
  components: { Figure, Bomb },
  props: {
    gridSize: Number, //размер поля
    islandCells: Array, //массив координат клеток острова
    baseRow: Number, //ряд базовой клетки
    baseCol: Number, //столбец базовой клетки
    currentFigure: {
      type: Object,
      default: null
    },
    bombs: {
      type: Object,
      default: () => ({ black: [], red: [], green: [] })
    }
  },
  data() {
    return {
      cellSize: 30
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
    },
    figureCells() {
    if (!this.currentFigure || this.currentFigure.position.row === -1) return []
    return this.currentFigure.cells.map(offset => ({
      row: this.currentFigure.position.row + offset[0],
      col: this.currentFigure.position.col + offset[1]
    }))
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
      background: #1bf0f8;
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

<template>
  <div class = "figure-grid">
    <div
      v-for = "(row, rowIndex) in cells"
      :key = "rowIndex"
      class = "figure-grid__row"
    >
      <EditorCell
        class = "figure-grid__cell"
        v-for = "(cell, colIndex) in row"
        :key = "colIndex"
        :active = "cell"
        @toggle = "() => toggleCell(rowIndex, colIndex)"
      />
    </div>
  </div>
</template>

<script>
import EditorCell from './EditorCell.vue'

export default {
  name: 'FigureGrid',
  components: { EditorCell },
  props: {
    cells: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  methods: {
    toggleCell(row, col) {
      const newCells = []
      this.cells.forEach((rowCells, i) => {
        const newRow = []
        rowCells.forEach((cell, j) => {
          if (i === row && j === col) {
            newRow.push(!cell)
          } else {
            newRow.push(cell)
          }
        })
        newCells.push(newRow)
      })
      this.$emit('update', newCells)
    }
  }
}
</script>

<style scoped lang = "scss">
.figure-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__row {
    display: flex;
    gap: 4px;
  }
}
</style>
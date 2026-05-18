<template>
  <div
    class="game-grid"
    :style="gridStyles"
  >
    <GameCell
      v-for="(cell, index) in flatGrid"
      :key="index"
      :cell="cell.item"
      :row="cell.row"
      :column="cell.column"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GameCell from './GameCell.vue'

export default {
  name: 'GameGrid',
  components: {
    GameCell,
  },
  computed: {
    ...mapGetters({
      grid: 'game/getGrid',
      gridSize: 'game/getGridSize',
    }),
    flatGrid () {
      const result = []
      this.grid.forEach((row, rowIndex) => {
        row.forEach((item, columnIndex) => {
          result.push({
            item,
            row: rowIndex,
            column: columnIndex,
          })
        })
      })
      return result
    },
    gridStyles () {
      return {
        gridTemplateColumns: `repeat(${this.gridSize}, 1fr)`,
      }
    },
  },
}
</script>

<style scoped lang="scss">
.game-grid {
  display: grid;
  gap: 10px;
  max-width: 720px;
}
</style>
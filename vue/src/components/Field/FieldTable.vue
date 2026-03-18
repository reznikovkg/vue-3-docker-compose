<template>
  <div>
    <div class="field-row" v-for="(row, rowIdx) in grid" :key="rowIdx">
        <div class="field-cell"
          :class="{
              'is-central': isCentral(rowIdx + 1, colIdx + 1),
              'piece': cell === 2,
              'attached-piece': cell === 3
          }"
          :style="{ '--grid-size': getFieldSize }"
          v-for="(cell, colIdx) in row" :key="colIdx">
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'FieldTable',
  props: {
    isSpeedUp: false
  },
  computed: {
    ...mapGetters('field', ['getFieldSize', 'getField']),
    ...mapGetters('cube', ['getCentralCubePosition']),
    ...mapGetters('game', ['getIsGameStarted']),

    grid() {
      return this.getField || []
    }
  },
  methods: {
    ...mapActions('cube', ['changeCentralCubePosition']),
    isCentral(row, col) {
      let {x, y} = this.getCentralCubePosition

      return y === row && x === col
    },
    move(dx, dy){
      if (!this.getIsGameStarted) {
        return
      }

      let {x, y} = this.getCentralCubePosition
      
      x += dx
      y += dy

      this.changeCentralCubePosition({x: x, y: y})
    }
  }
}
</script>

<style scoped>

.field-row {
  display: flex;
}

.field-cell {
  border-left: 0.25vmin solid #000000;
  border-top: 0.25vmin solid #000000;
  border-right: 0.25vmin solid #000000;
  border-bottom: 0.25vmin solid #000000;
  
  width: calc(80vmin / var(--grid-size));
  height: calc(80vmin / var(--grid-size));
  background-color: white;
}

.piece {
  background-color: #ff9800;
}

.is-central{
  background-color: red;
}
.attached-piece {
  background-color: rgb(7, 36, 199);
}
</style>
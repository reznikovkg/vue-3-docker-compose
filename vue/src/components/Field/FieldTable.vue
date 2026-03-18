<template>
  <div class="field-table">
    <div class="field-row" v-for="(row, rowIdx) in grid" :key="rowIdx">
        <div class="field-cell"
          :class="{
              'is-central': isCentral(rowIdx + 1, colIdx + 1),
              'piece': cell === 2,
              'attached-piece': cell === 3,
              'black-bomb': cell === 11,
              'red-bomb': cell === 12,
              'green-bomb': cell === 13
          }"
          :style="{ '--grid-size': getFieldSize }"
          v-for="(cell, colIdx) in row" :key="colIdx">
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
    isCentral(row, col) {
      let {x, y} = this.getCentralCubePosition
      return y === row && x === col
    },
  }
}
</script>

<style scoped>

.field-table {
  border: 0.25vmin solid #000000;
}

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

.black-bomb {
  background-color: black;
}
.red-bomb {
  background-color: red;
}
.green-bomb {
  background-color: green;
}
</style>
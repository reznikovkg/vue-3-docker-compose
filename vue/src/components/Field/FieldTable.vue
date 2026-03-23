<template>
  <div class="field-table">
    <div class="field-table__field-row" v-for="(row, rowIdx) in grid" :key="rowIdx">
        <div class="field-table__field-cell"
          :class="{
              'field-table__field-cell__central': isCentral(rowIdx + 1, colIdx + 1),
              'field-table__field-cell__external-piece': cell === 2,
              'field-table__field-cell__attached-piece': cell === 3,
              'field-table__field-cell__black-bomb': cell === 11,
              'field-table__field-cell__red-bomb': cell === 12,
              'field-table__field-cell__green-bomb': cell === 13
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

<style lang="scss" scoped>

.field-table {
  border: 0.25vmin solid #000000;

  &__field-row {
    display: flex;
  }

  &__field-cell {
    border: 0.25vmin solid #000000;
    
    width: calc(80vmin / var(--grid-size));
    height: calc(80vmin / var(--grid-size));
    background-color: white;

    &__external-piece {
      background-color: #ff9800;
    }
    &__central{
      background-color: #800020;
    }
    &__attached-piece {
      background-color: rgb(7, 36, 199);
    }
    &__black-bomb {
      background-color: black;
    }
    &__red-bomb {
      background-color: red;
    }
    &__green-bomb {
      background-color: green;
    }
  }
}
</style>
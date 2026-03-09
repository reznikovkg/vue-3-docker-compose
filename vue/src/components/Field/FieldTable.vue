<template>
  <table 
    class="field-table"
    @keydown.up="move(0, -1)"
    @keydown.down="move(0, 1)"
    @keydown.left="move(-1, 0)"
    @keydown.right="move(1, 0)">
    <tbody>
      <tr v-for="(row, rowIdx) in grid" :key="rowIdx">
        <td 
        class="field-td" 
        :style="{ '--grid-size': this.getFieldSize }"
        :class="{
          'is-central': isCentral(rowIdx + 1, colIdx + 1),
          'piece': cell === 2,
          'attached-piece': cell === 3
        }"
        v-for="(cell, colIdx) in row"
        :key="colIdx">
        </td>
      </tr>
    </tbody>
  </table>
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
.field-table {
  border-collapse: collapse;
  width: fit-content;
  table-layout: fixed;
}
.field-td {
  border: 0.5vmin solid #000000;
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
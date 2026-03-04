<template>
  <table 
    class="field-table"
    tabindex="0"
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
          isCentral: isCentral(rowIdx, colIdx),
          piece: cell === 2
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
  computed: {
    ...mapGetters('field', ['getFieldSize', 'getField']),
    ...mapGetters('cube', ['getCentralCubePosition']),

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

.field-td.piece {
  background-color: #ff9800;
}

.isCentral{
  background-color: red;
}
</style>
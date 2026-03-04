<template>
  <table class="field-table">
    <tbody>
      <tr v-for="(row, rowIdx) in grid" :key="rowIdx">
        <td
          v-for="(cell, colIdx) in row"
          :key="colIdx"
          class="field-td"
          :class="{ piece: cell === 2 }"
          :style="{ '--grid-size': getFieldSize }"
        ></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FieldTable',
  computed: {
    ...mapGetters('field', ['getFieldSize', 'getField']),
    grid() {
      return this.getField || []
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
</style>
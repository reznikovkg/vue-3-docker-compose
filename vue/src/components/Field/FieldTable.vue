<template>
  <table 
    class="field-table"
    tabindex="0"
    @keydown.up="move(0, -1)"
    @keydown.down="move(0, 1)"
    @keydown.left="move(-1, 0)"
    @keydown.right="move(1, 0)">
    <tbody>
      <tr v-for="row in this.getFieldSize" :key="row">
        <td class="field-td" :style="{ '--grid-size': this.getFieldSize }"
        :class="{
          'isCentral': isCentral(row, col)
        }"
        v-for="col in this.getFieldSize" :key="col">
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
    ...mapGetters('field', ['getFieldSize']),
    ...mapGetters('cube', ['getCentralCubePosition'])
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
}

.isCentral{
  background-color: red;
}
</style>
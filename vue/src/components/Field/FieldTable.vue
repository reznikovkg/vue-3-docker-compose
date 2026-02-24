<template>
  <table class="field-table">
    <tbody>
      <tr v-for="row in this.getSize" :key="row">
        <td class="field-td" v-for="col in this.getSize" :key="col" width="80vmin / this.cellSize" height="80vmin / this.cellSize">
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FieldTable',
  computed: {
    ...mapGetters('field', ['getSize']),
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
  border: 1px solid #000000;
}
</style>
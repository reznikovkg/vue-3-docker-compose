<template>
  <table class="field-table">
    <tbody>
      <tr v-for="row in this.getFieldSize" :key="row">
        <td class="field-td" :style="{ '--grid-size': this.getFieldSize }" v-for="col in this.getFieldSize" :key="col">
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
    ...mapGetters('field', ['getFieldSize']),
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
</style>
<template>
  <div 
    class="puzzle__grid" 
    :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
  >
    <Cell
      v-for="(cell, i) in cells"
      :key="i"
      :value="cell"
      :index="i"
      :size="size"
      :is-blocked="currentMode === 'block' && blockedCell === i"
      :is-frozen="isFrozen(i)"
      @click="(index) => $emit('cell-click', index)"
    />
  </div>
</template>
<script>
import Cell from './Cell.vue'
export default {
  name: 'Grid',
  components: {
    Cell
  },
  props: {
    cells: Array,
    size: Number,
    currentMode: String,
    blockedCell: Number,
    isFrozen: Function
  }
}
</script>
<style scoped lang="scss">
.puzzle__grid {
  display: grid;
  gap: 8px;
  background: #ccc;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  aspect-ratio: 1;
}
</style>
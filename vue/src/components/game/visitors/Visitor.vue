<template>
  <div class="visitor" :style="style"></div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  visitor: {
    type: Object,
    required: true
  }
})

const CELL_SIZE = 60

const style = computed(() => {
  const node = props.visitor.node

  const [x, y] = node.split('-').map(Number)

  return {
    left: `${x * CELL_SIZE + CELL_SIZE / 2 - 5}px`,
    top: `${y * CELL_SIZE + CELL_SIZE / 2 - 5}px`,
    transition: 'left 0.5s linear, top 0.5s linear'
  }
})
</script>

<style scoped lang="less">
.visitor {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: black;
  pointer-events: none;
}
</style>

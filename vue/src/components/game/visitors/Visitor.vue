<template>
  <div class="visitor" :style="style">
    <div class="visitor__label">
      {{ money }}
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  money: Number,
  node: String,
})

const CELL_SIZE = 60

const style = computed(() => {
  const node = props.node

  const [x, y] = node.split(':').map(Number)
  const size = 20 + props.money * 0.1

  return {
    left: `${x * CELL_SIZE + CELL_SIZE / 2 - size / 2}px`,
    top: `${y * CELL_SIZE + CELL_SIZE / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: props.money > 70
        ? 'green'
        : props.money > 40
            ? 'orange'
            : 'red',
    transition: 'left 0.8s linear, top 0.8s linear'
  }
})
</script>

<style scoped lang="less">
.visitor {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: center;

  &__label {
    position: absolute;
    font-size: 16px;
    font-weight: bold;
    font-family: Arial, sans-serif;
    color: #000;
    white-space: nowrap;
  }
}
</style>

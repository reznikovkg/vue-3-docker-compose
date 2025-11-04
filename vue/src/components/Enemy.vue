<template>
  <div
    class="enemy"
    :class="{ enemy__selected: selected }"
    :style="{
      'left': `${position.x - 10}px`,
      'top': `${position.y - 10}px`,
      'background-color': `hsl(${health * 1.2}, 70%, 50%)`,
    }"
    @click="handleClick"
  >
    <div class="enemy__health-bar" :style="{ width: `${health}%` }"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

import { Point } from '@/shared/types';

defineProps<{
  position: Point;
  selected: boolean;
  health: number;
}>();

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss">
.enemy {
  position: absolute;
  inline-size: 20px;
  block-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 4;
  transition: transform 0.2s;

  &__selected {
    transform: scale(1.3);
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.7);
  }

  &__health-bar {
    position: relative;
    top: -5px;
    left: 0;
    height: 2px;
    background-color: #4caf50;
  }
}
</style>

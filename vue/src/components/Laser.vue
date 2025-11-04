<template>
  <svg class="laser">
    <line
      class="laser__line"
      :x1="start.x"
      :y1="start.y"
      :x2="end.x"
      :y2="end.y"
    />
  </svg>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

import { Point } from '@/shared/types';

defineProps<{
  start: Point;
  end: Point;
}>();
</script>

<style lang="scss">
.laser {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;

  &__line {
    stroke: #ff5722;
    stroke-width: 2px;
    stroke-opacity: 0.8;
  }
}
</style>

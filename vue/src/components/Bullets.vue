<template>
  <svg class="bullets">
    <line
      class="bullets__line"
      :x1="start.x"
      :y1="start.y"
      :x2="end.x"
      :y2="end.y"
    />
  </svg>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

import { Point } from '@/shared/models';

export interface BulletsProps {
  start: Point;
  end: Point;
}

defineProps<BulletsProps>();
</script>

<style lang="scss">
.bullets {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: $z-bullets;
  border-radius: 50%;

  &__line {
    stroke: #fbf9f9;
    stroke-width: 3px;
    stroke-opacity: 0.8;
    stroke-dasharray: 3 7;
    animation: shooting 0.8s linear infinite;
  }
}

@keyframes shooting {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -50;
  }
}
</style>

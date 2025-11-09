<template>
  <svg class="zone" viewBox="0 0 100 100" preserveAspectRatio="none">
    <polygon
      class="zone__polygon"
      :points="polygonPoints"
      fill="#08d68a4d"
      fill-opacity="0.2"
      stroke="#08d68acc"
      stroke-width="0.5"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

import { Point } from '@/shared/models';

export interface ZoneProps {
  points: Point[];
}

const props = defineProps<ZoneProps>();

const polygonPoints = computed(() => {
  return props.points.map((point) => `${point.x},${point.y}`).join(' ');
});
</script>

<style lang="scss">
.zone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

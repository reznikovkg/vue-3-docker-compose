<template>
  <div>
    <div
      class="tower"
      :style="{
        left: `${position.x - 15}px`,
        top: `${position.y - 15}px`,
      }"
    >
      <div class="tower__base"></div>
      <div class="tower__top"></div>
      <div class="tower__level">Lv.{{ level }}</div>
    </div>

    <div
      class="tower__radius-indicator"
      :style="{
        left: `${position.x - radius}px`,
        top: `${position.y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
      }"
    ></div>

    <Laser v-if="target" :start="position" :end="target" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

import Laser from './Laser.vue';

import { Point } from '@/shared/types';

defineProps<{
  position: Point;
  radius: number;
  level: number;
  target: Point;
}>();
</script>

<style lang="scss">
.tower {
  position: absolute;
  width: 30px;
  height: 30px;
  z-index: 3;
  &__base {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(120, 120, 120, 255);
    border-radius: 50%;
  }
  &__top {
    position: absolute;
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    background-color: rgba(150, 150, 150, 255);
    border-radius: 50%;
  }
  &__level {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    font-weight: bold;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1px 3px;
    border-radius: 3px;
  }
  &__radius-indicator {
    position: absolute;
    border-radius: 50%;
    border: 1px dashed rgba(66, 185, 131, 0.5);
    pointer-events: none;
    z-index: 3;
  }
}
</style>

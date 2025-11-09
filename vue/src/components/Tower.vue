<template>
  <div class="tower-container">
    <div class="tower-radius" :style="radiusStyle"></div>

    <div
      class="tower"
      :style="towerStyle"
      :class="{ tower_attacking: isAttacking }"
    >
      <div class="tower__main"></div>
      <div class="tower__level">{{ level }}</div>
    </div>

    <Bullets v-if="target" :start="position" :end="target" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Bullets from './Bullets.vue';

import { Point } from '@/shared/models';

const TOWER_SIZE = 30;
const TOWER_HALF_SIZE = TOWER_SIZE / 2;

export interface TowerProps {
  position: Point;
  radius: number;
  level: number;
  target?: Point | null;
}

const props = withDefaults(defineProps<TowerProps>(), {
  target: null,
});

const towerStyle = computed(() => ({
  blockSize: `${TOWER_SIZE}px`,
  inlineSize: `${TOWER_SIZE}px`,
  left: `${props.position.x - TOWER_HALF_SIZE}px`,
  top: `${props.position.y - TOWER_HALF_SIZE}px`,
}));

const radiusStyle = computed(() => ({
  left: `${props.position.x - props.radius}px`,
  top: `${props.position.y - props.radius}px`,
  width: `${props.radius * 2}px`,
  height: `${props.radius * 2}px`,
}));

const isAttacking = computed(() => !!props.target);
</script>

<style lang="scss">
$tower-main-color: rgba(117, 115, 119, 0.5);
$tower-level-bg: rgba(0, 0, 0, 0.7);
$tower-radius-color: rgba(66, 185, 131, 0.5);

.tower-container {
  position: absolute;
  block-size: 100%;
  inline-size: 100%;
}

.tower {
  position: absolute;
  z-index: $z-tower;
  pointer-events: auto;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &_attacking {
    animation: pulse 0.5s ease-in-out infinite;
  }
}

.tower__main {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: $tower-main-color;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tower__level {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: $fw-bold;
  color: white;
  background-color: $tower-level-bg;
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
}

.tower-radius {
  position: absolute;
  position: absolute;
  border-radius: 50%;
  border: 1px dashed $tower-radius-color;
  pointer-events: none;
  z-index: $z-tower-radius;
}

@keyframes pulse {
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>

<template>
  <div class="ally" :style="allyStyle">
    <div class="ally__radius" :style="radiusStyle"></div>
    <div class="ally__health-bar" :style="healthBarStyle"></div>
    <div class="ally__body" :style="allyBodyStyle">
      <div class="ally__shield"></div>
    </div>
  </div>
  <Bullets v-if="target" :start="position" :end="target" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Bullets from './Bullets.vue';

import { Point } from '@/shared/models';
import { AllyType } from '@/shared/types';

export interface AllyProps {
  position: Point;
  health: number;
  maxHealth: number;
  allyType: AllyType;
  target?: Point | null;
  attackRadius: number;
}

const props = withDefaults(defineProps<AllyProps>(), {
  target: null,
});

const ALLY_SHADOWS: Record<AllyType, string> = {
  soldier: '0 0 16px 4px rgba(0, 150, 255, 0.7)',
  heavy_soldier: '0 0 16px 4px rgba(0, 100, 200, 0.9)',
};

const ALLY_SIZE = 30;
const ALLY_HALF_SIZE = ALLY_SIZE / 2;

const allyStyle = computed(() => ({
  left: `${props.position.x - ALLY_HALF_SIZE}px`,
  top: `${props.position.y - ALLY_HALF_SIZE}px`,
}));

const ratio = computed(() =>
  Math.max(0, Math.min(1, props.health / props.maxHealth))
);

const healthBarStyle = computed(() => ({
  width: `${Math.round(ratio.value * 100)}%`,
}));

const shadowColor = computed(() => ALLY_SHADOWS[props.allyType]);

const radiusStyle = computed(() => ({
  width: `${props.attackRadius * 2}px`,
  height: `${props.attackRadius * 2}px`,
  left: `${ALLY_HALF_SIZE - props.attackRadius}px`,
  top: `${ALLY_HALF_SIZE - props.attackRadius}px`,
}));

const allyBodyStyle = computed(() => ({
  'block-size': `${ALLY_SIZE}px`,
  'inline-size': `${ALLY_SIZE}px`,
  'background-color': `rgba(50, 120, 200, ${ratio.value})`,
  'box-shadow': shadowColor.value,
}));
</script>

<style lang="scss">
.ally {
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 2px;
  position: absolute;
  z-index: $z-enemy;
  top: 0;
  left: 0;

  &__radius {
    position: absolute;
    border: 2px dashed rgba(0, 150, 255, 0.3);
    border-radius: 50%;
    pointer-events: none;
    z-index: calc($z-enemy - 1);
  }

  &__body {
    border-radius: 30%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: $z-enemy;
  }

  &__shield {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(200, 200, 255, 0.8);
    border-radius: 50%;
  }

  &__health-bar {
    block-size: 4px;
    border-radius: 3px;
    background-color: #4a90e2cc;
    z-index: calc($z-enemy + 1);
  }
}
</style>

<template>
  <div class="enemy" :style="enemyStyle">
    <div class="enemy__health-bar" :style="healthBarStyle"></div>
    <div class="enemy__body" :style="enemyBodyStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

import { Point } from '@/shared/models';
import { EnemyType } from '@/shared/types';

export interface EnemyProps {
  position: Point;
  health: number;
  maxHealth: number;
  type: EnemyType;
}

const props = defineProps<EnemyProps>();

const ENEMY_SHADOWS: Record<EnemyType, string> = {
  common: '0 0 16px 4px rgba(0, 255, 128, 0.7)',
  medium: '0 0 16px 4px rgba(255, 213, 0, 0.7)',
  hard: '0 0 16px 4px rgba(255, 49, 49, 0.8)',
};

const ENEMY_SIZE = 30;
const ENEMY_HALF_SIZE = ENEMY_SIZE / 2;

const enemyStyle = computed(() => ({
  left: `${props.position.x - ENEMY_HALF_SIZE}px`,
  top: `${props.position.y - ENEMY_HALF_SIZE}px`,
}));

const ratio = computed(() =>
  Math.max(0, Math.min(1, props.health / props.maxHealth))
);

const healthBarStyle = computed(() => ({
  width: `${Math.round(ratio.value * 100)}%`,
}));

const shadowColor = computed(() => ENEMY_SHADOWS[props.type]);

const enemyBodyStyle = computed(() => ({
  'block-size': `${ENEMY_SIZE}px`,
  'inline-size': `${ENEMY_SIZE}px`,
  'background-color': `rgba(128, 128, 128, ${ratio.value})`,
  'box-shadow': shadowColor.value,
}));
</script>

<style lang="scss">
.enemy {
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 2px;
  position: absolute;
  z-index: $z-enemy;
  top: 0;
  left: 0;

  &__body {
    border-radius: 30%;
  }

  &__health-bar {
    block-size: 4px;
    border-radius: 3px;
    background-color: #0bc27fcc;
    z-index: calc($z-enemy + 1);
  }
}
</style>

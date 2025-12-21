<template>
  <div class="shooter-enemy" :style="enemyStyle">
    <div class="shooter-enemy__radius" :style="radiusStyle"></div>
    <div class="shooter-enemy__health-bar" :style="healthBarStyle"></div>
    <div class="shooter-enemy__body" :style="enemyBodyStyle">
      <div class="shooter-enemy__weapon"></div>
    </div>
  </div>
  <Bullets
    v-if="shootTarget"
    :start="position"
    :end="shootTarget"
    color="enemy"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Bullets from './Bullets.vue';

import { Point } from '@/shared/models';
import { ShooterEnemyType } from '@/shared/types';

export interface ShooterEnemyProps {
  position: Point;
  health: number;
  maxHealth: number;
  shooterType: ShooterEnemyType;
  shootTarget?: Point | null;
  shootRadius: number;
}

const props = withDefaults(defineProps<ShooterEnemyProps>(), {
  shootTarget: null,
});

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

const radiusStyle = computed(() => ({
  width: `${props.shootRadius * 2}px`,
  height: `${props.shootRadius * 2}px`,
  left: `${ENEMY_HALF_SIZE - props.shootRadius}px`,
  top: `${ENEMY_HALF_SIZE - props.shootRadius}px`,
}));

const enemyBodyStyle = computed(() => ({
  'block-size': `${ENEMY_SIZE}px`,
  'inline-size': `${ENEMY_SIZE}px`,
  'background-color': `rgba(180, 80, 0, ${ratio.value})`,
}));
</script>

<style lang="scss">
.shooter-enemy {
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
    border: 2px dashed rgba(255, 100, 0, 0.3);
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

  &__weapon {
    width: 12px;
    height: 4px;
    background-color: rgba(50, 50, 50, 0.8);
    border-radius: 2px;
  }

  &__health-bar {
    block-size: 4px;
    border-radius: 3px;
    background-color: #ff6b35cc;
    z-index: calc($z-enemy + 1);
  }
}
</style>
